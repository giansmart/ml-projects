//import * as tf from '@tensorflow/tfjs'

const maxSizeColor = 255

//Hiperparametros
const learningRate = 0.001;
const nEpochs = 30;
const optimizer = tf.train.adam(learningRate)

//Inicializar la red neuronal
const model = tf.sequential();

//orden: rojo, verde, azul

const xArray = [
    [0,0,0],
    [255,255,255],
    [100,0,0],
    [150,0,0],
    [150,50,0],
    [0,255,0],
    [0,0,255],
    [0,255,255],
    [0,100,100],
    [255,180,100],
    [232,218,239],
    [100,255,255],
    [22,3,97]
]

const yArray = [[1],[0],[1],[1],[1],[0],[1],[0],[1],[0],[0],[0],[1]]

async function loadModel(){
    console.log('entrenando modelo...')
    const xArrayScaled = scaleValues(xArray)
    const xDataset = tf.data.array(xArrayScaled);
    const yDataset = tf.data.array(yArray);
    const xyDataset = tf.data.zip({xs: xDataset, ys: yDataset})
                    .batch(4)
                    .shuffle(4);

    console.log(xyDataset);
    
    model.add(tf.layers.dense({units: 16, inputShape: [3], activation: 'relu'}));
    model.add(tf.layers.dense({units: 16, activation: 'relu'}))
    model.add(tf.layers.dense({units: 1, activation: 'sigmoid'}));
    
    model.compile({optimizer: 'sgd', loss: 'binaryCrossentropy', optimizer: optimizer});
    const history = await model.fitDataset(xyDataset, {
        epochs: nEpochs,
        callbacks: {onEpochEnd: async(epoch, logs) => {
            console.log(logs.loss);
            //await tf.nextFrame();
        }}
    });
}

async function update(color){
    //Aqui hacemos el objeto "rgb" para que sea similar al video
    var rgb = [color.channels.r, color.channels.g, color.channels.b];
    console.log(rgb);
    var divcolor = document.getElementById('color-zone');
    divcolor.style.background = color.toHEXString();
    
    colores = [rgb[0]/maxSizeColor, rgb[1]/maxSizeColor, rgb[2]/maxSizeColor]
    //colores = [1,1,1]

    console.log('colores',colores)

    //Obtener la prediccion de la red
    predicted_tensor = await model.predict(tf.tensor2d(colores,[1,3]));
    //console.log(color_predicted)
    color_predicted = predicted_tensor.dataSync()[0]
    console.log({color_predicted})
    //console.log('predicted value: '+ color_predicted);

    //imprimir la prediccion del color
    //console.log(resultado)
    if( color_predicted > .5){
        divcolor.style.color = 'white';
    } else{
        divcolor.style.color = 'black';
    }
}

function scaleValues(arrayElements){
    const scaledArray = new Array(2)
    for(let i=0; i<arrayElements.length; i++){
        let rgbArray = arrayElements[i]
        scaledArray[i] = new Array(arrayElements.length)
        for(j=0; j<rgbArray.length; j++){
            let scaledValue = rgbArray[j] / maxSizeColor
            scaledArray[i][j] = scaledValue
        }
        //console.log(scaledArray[i])
    }
    return scaledArray
}

//scaleValues(xArray)
//scaleValues([[255,255,255]])
//loadModel()

async function initialize(){
    await loadModel()
    showPage()
}

function showPage() {
  document.getElementById("loader").style.display = "none";
  document.getElementById("myDiv").style.display = "block";
}