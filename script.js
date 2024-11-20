let chart = null;

function generarDiagrama() {
    // Obtener los valores de los inputs
    const fc = parseFloat(document.getElementById('fc').value);
    const fy = parseFloat(document.getElementById('fy').value);
    const b = parseFloat(document.getElementById('b').value);
    const h = parseFloat(document.getElementById('h').value);
    const as = parseFloat(document.getElementById('as').value);
    const asNeg = parseFloat(document.getElementById('asNeg').value);
    const r = parseFloat(document.getElementById('r').value);
    const Mu = parseFloat(document.getElementById('Mu').value);
    const Pu = parseFloat(document.getElementById('Pu').value);

      // Calcular b1 utilizando la función
    const b1 = calcularB1(fc);
  
    // Realizar cálculos y generación del diagrama aquí (no implementado en este ejemplo)
    // Aquí se calcularían las coordenadas de los puntos en el diagrama de interacción
  
    // Ejemplo de salida en consola
    console.log(`Valores ingresados: f'c=${fc}, fy=${fy}, b=${b}, h=${h}, As=${as}, As'=${asNeg}, r=${r}`);
    console.log("¡Aquí iría la lógica para generar el diagrama de interacción!");

    console.log(`b1=${b1}`)

    // Generar lista de valores para la variable 'c'
    const c = Array.from({ length: Math.ceil(10 / 0.005) }, (_, index) => (index + 1) * 0.005);

    //const c = [0.001, 0.01, 0.05, 0.1, 0.4, 0.5,5, 100];
    
    // Calcular valor de a
    const a = c.map(c_resul => {
        if (c_resul* b1>h) {
            return h;
        }
        return c_resul * b1; // Operacion para obtener a
    });

    console.log(a)
    
    const Es = 200000 // MPa
    const eu = 0.003 //Deformacion unitaria del hormigón
    const dp = r
    const d  = h-r

    // Resolver la ecuación para cada valor de 'fsy'
    const fsn = c.map(c_val => {
        if  (Math.abs(Es * eu * ((c_val - dp) / c_val))>fy){
            return Math.sign(((c_val - dp) / c_val))*fy
        }
        return Es * eu * ((c_val - dp) / c_val);
    }); 
    console.log(fsn)

    // Resolver la ecuación para cada valor de 'fs'
    const fs = c.map(c_val => {
        if  (Math.abs(Es * eu * ((d - c_val) / c_val))>fy){
            return Math.sign(((d - c_val) / c_val))*fy
        }
        return Es * eu * ((d - c_val) / c_val);
    }); 
    console.log(fs)

    // Resolver la ecuación para cada valor de 'Pn'
    const Pn = a.map((a_val,i) => {
        return (0.85*fc*a_val*b+fsn[i]*asNeg*1e-4-fs[i]*as*1e-4)*1000;
    }); 
    console.log(Pn)

    // Resolver la ecuación para cada valor de 'Pn'
    const Mn = a.map((a_val,i) => {
        return (0.85*fc*a_val*b*((h/2)-(a_val/2)) + fsn[i]*asNeg*1e-4*((h/2)-(dp)) + fs[i]*as*1e-4*(d-(h/2)))*1000;
    }); 
    console.log(Mn)

    
    generarGrafico(Mn, Pn);
    agregarPunto(Mu, Pu);

  } // Termino de generarDiagrama()
  

  // Funcion que devuelve el valor de beta1 a usar en función de f'c
  function calcularB1(fc) {
    if (fc >= 55) {
      return 0.65;
    } else if (fc >= 28 && fc < 55) {
      return 0.85-(0.05*(fc-28)/7);
    } else if (fc >= 17 && fc < 28) {
      return 0.85;
    } else {
      // En caso de que el valor de fc no esté en ninguno de los rangos especificados
      return null; // O podrías manejarlo según tu lógica específica
    }
  }
  


  function generarGrafico(Mn, Pn) {

    if (chart !== null) {
        chart.destroy();
      }
    // Get the canvas for the chart
    const ctx = document.getElementById('diagramCanvas').getContext('2d');

    // Create the scatter chart with Chart.js
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [{
          label: 'Plot',
          data: Mn.map((value, index) => ({ x: value, y: Pn[index] })),
          backgroundColor: 'blue', // Point color
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            title: {
              display: true,
              text: 'Mn' // X-axis label
            }
          },
          y: {
            type: 'linear',
            title: {
              display: true,
              text: 'Pn' // Y-axis label
            }
          }
        }
      }
    });
  }


  function agregarPunto(Mu, Pu) {
    // Suponiendo que tienes una instancia de Chart guardada en la variable 'chart'
    if (chart) {
      // Agregar el punto como un nuevo conjunto de datos
      chart.data.datasets.push({
        label: 'Mu,Pu',
        data: [{ x: Mu, y: Pu }],
        backgroundColor: 'red',
        pointRadius: 5,
        pointHoverRadius: 7
      });
  
      // Actualizar el gráfico
      chart.update();
    }
  }


  function copiarGrafico() {

    console.log(chart)
    if (chart !== null) {
      html2canvas(document.querySelector('#diagramCanvas')).then(canvas => {
        canvas.toBlob(blob => {
          const item = new ClipboardItem({ 'image/png': blob });
          navigator.clipboard.write([item]).then(() => {
            alert('¡Gráfico copiado al portapapeles!');
          }).catch(err => {
            console.error('Error al copiar al portapapeles:', err);
          });
        });
      });
    }
  }