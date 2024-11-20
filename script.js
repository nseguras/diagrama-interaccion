let chart = null;

function generarDiagrama() {
    // Obtener los valores de los inputs
    const fc = parseFloat(document.getElementById('fc').value);
    const fy = parseFloat(document.getElementById('fy').value);
    const b = parseFloat(document.getElementById('b').value)/1000;
    const h = parseFloat(document.getElementById('h').value)/1000;
    const as = parseFloat(document.getElementById('as').value);
    const asNeg = parseFloat(document.getElementById('asNeg').value);
    const r = parseFloat(document.getElementById('r').value)/1000;
    //const Mu = parseFloat(document.getElementById('Mu').value);
    //const Pu = parseFloat(document.getElementById('Pu').value);
		
      // Calcular b1 utilizando la función
    const b1 = calcularB1(fc);
  
    // Realizar cálculos y generación del diagrama aquí (no implementado en este ejemplo)
    // Aquí se calcularían las coordenadas de los puntos en el diagrama de interacción
  
    // Ejemplo de salida en consola
    console.log(`Valores ingresados: f'c=${fc}, fy=${fy}, b=${b}, h=${h}, As=${as}, As'=${asNeg}, r=${r}`);
    console.log("¡Aquí iría la lógica para generar el diagrama de interacción!");

    //console.log(`b1=${b1}`)

    // Generar lista de valores para la variable 'c'
    const c = Array.from({ length: Math.ceil(20 / 0.005) }, (_, index) => (index + 1) * 0.005);

    //const c = [0.003, 0.006, 0.009, 0.1, 0.4, 0.5,5, 100];
    
    // Calcular valor de a
    const a = c.map(c_resul => {
        if (c_resul* b1>h) {
            return h;
        }
        return c_resul * b1; // Operacion para obtener a
    });

    //console.log(a)
    
    const Es = 200000 // MPa
    const eu = 0.003 //Deformacion unitaria del hormigón
    const dp = r
    const d  = h-r

    // Resolver la ecuación para cada valor de 'fsy'
    const fsn = c.map(c_val => {
		//Condicion que no supere fy (ni positivo ni negativo)
        if  (Math.abs(Es * eu * ((c_val - dp) / c_val))>fy){
            return Math.sign(((c_val - dp) / c_val))*fy
        }
        return Es * eu * ((c_val - dp) / c_val);
    }); 
    //console.log(fsn)

    // Resolver la ecuación para cada valor de 'fs'
    const fs = c.map(c_val => {
		//Condicion que no supere fy (ni positivo ni negativo)
        if  (Math.abs(Es * eu * ((d - c_val) / c_val))>fy){
            return Math.sign(((d - c_val) / c_val))*fy
        }
        return Es * eu * ((d - c_val) / c_val);
    }); 
    
	//console.log(fs)

    // Resolver la ecuación para cada valor de 'Pn'
    const Pn = a.map((a_val,i) => {
        return (0.85*fc*a_val*b+fsn[i]*asNeg*1e-4-fs[i]*as*1e-4)*1000/9.08665;
    }); 
	
    //console.log(Pn)

    // Resolver la ecuación para cada valor de 'Mn'
    const Mn = a.map((a_val,i) => {
        return (0.85*fc*a_val*b*((h/2)-(a_val/2)) + fsn[i]*asNeg*1e-4*((h/2)-(dp)) + fs[i]*as*1e-4*(d-(h/2)))*1000/9.08665;
    }); 
	
	//---------------------------------
	// RESOLVER CON FACTORES DE SEGURIDAD. FS
	//---------------------------------
	
	// OBTENER DEFORMACION EN EL ACERO traccionado
    const et = c.map((c_val,i) => {
        return eu*((d-c_val)/c_val);
    }); 
	
	
	let Pnmax=Math.max(...Pn); // Determinar valor maximo de Pn
	
	const phi = et.map((et_val,i) => {
		if (et_val>=0.005){
			return 0.9
		} else if (et_val<=fy/Es){
			return 0.65
		}else {
			return 0.65+(0.25*(et_val-(fy/Es))/(0.005-(fy/Es)))
		}		
        
    }); 
	
	// Resolver la ecuación para cada valor de 'Pn'
    const phiPn = Pn.map((Pn_val,i) => {
		if (0.8*Pnmax<Pn_val){
			return 0.8*Pnmax*0.65
		}
        return Pn_val*phi[i];
    }); 
	
    //console.log(Pn)

    // Resolver la ecuación para cada valor de 'Pn'
    const phiMn = Mn.map((Mn_val,i) => {
        return Mn_val*phi[i];
    }); 
	
    // console.log(et)
   
   
    //---------------------------------
    var fileInput = document.getElementById('fileInput');
	var graficarButton = document.getElementById('graficarButton')
  

    generarGrafico(Mn, Pn, phiMn, phiPn);
    agregarPunto();

  } // Termino de generarDiagrama()
  
//---------------------------------------------------------------------------------------------------
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
  
  function generarGrafico(Mn, Pn, phiMn, phiPn) {

    if (chart !== null) {
        chart.destroy();
      }
    // Get the canvas for the chart
	const ctx = document.getElementById('diagramCanvas').getContext('2d');
	
	
	// Generar datos para graficar: 
	const datos1 ={
		label: "Nominal",
		data: Mn.map((value, index) => ({ x: value, y: Pn[index] })),
		//backgroundColor: 'blue', // Point color
		backgroundColor: 'grey', // Point color
		borderColor: 'grey',
		pointRadius: 0,
		fill: false
	};

	const datos2 ={
		label: "LRFD",
		data: phiMn.map((value, index) => ({ x: value, y: phiPn[index] })),
		backgroundColor: 'orange', // Point color
		borderColor: 'orange',
		pointRadius: 0,
		fill: false
	};
	
    // Create the scatter chart with Chart.js
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [
			datos1,
			datos2,
		]
      },
      options: {
		plugins: {
            title: {
                display: true,
                text: 'Diagrama de Interacción'
            }
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
			min: 0,
            title: {
              display: true,
              text: 'Momento [tonf*m]' // X-axis label
            }
          },
          y: {
            type: 'linear',
            title: {
              display: true,
              text: 'Carga Axial [tonf]' // Y-axis label
            }
          }
        }
      }
    });
  }


  function agregarPunto() {
    // Suponiendo que tienes una instancia de Chart guardada en la variable 'chart'
    if (chart) {		
		var file = fileInput.files[0];
		var reader = new FileReader();
		reader.onload = function(e) {
		  var data = new Uint8Array(e.target.result);
		  var workbook = XLSX.read(data, {type: 'array'});
		  var sheet = workbook.Sheets[workbook.SheetNames[0]];
		  var jsonData = XLSX.utils.sheet_to_json(sheet, {header: 1});

		  var MValues = jsonData.slice(1).map(row => row[1]);
		  var PValues = jsonData.slice(1).map(row => row[0]);
		  
		    // Agregar el punto como un nuevo conjunto de datos
		  chart.data.datasets.push({
			type: 'scatter',
			label: 'Solicitación',
			data: MValues.map((x, i) => ({ x, y: PValues[i] })),
			backgroundColor: 'red',
			//pointRadius: 5,
			//pointHoverRadius: 7
		  });
	  
		  // Actualizar el gráfico
		  chart.update();
		};
		reader.readAsArrayBuffer(file);
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