import * as tf from '@tensorflow/tfjs'

const model = tf.sequential()

        //orden: rojo, verde, azul
        const xArray = [
            //Fondo negro (entrada en 0s) = texto blanco (salida = 1)
            [0, 0, 0],
            //Fondo blanco (entrada en 1s) = texto negro (salida = 0)
            [1, 1, 1],
            [0, 1, 0],
            //Fondo azul, texto blanco
            [0, .43, 1],
            //Fondo rojo, texto blanco
            [1, 0, 0]
        ];
        const yArray = [1, 0, 0, 1, 1];

        const colorData = [
            //Fondo negro (entrada en 0s) = texto blanco (salida = 1)
            [0, 0, 0, 1],
            //Fondo blanco (entrada en 1s) = texto negro (salida = 0)
            [1, 1, 1, 0],
            //Fondo verde, texto negro
            [0, 1, 0, 0],
            //Fondo azul, texto blanco
            [0, .43, 1, 1],
            //Fondo rojo, texto blanco
            [1, 0, 0, 1]
        ];
        const COLOR_CLASSES = ['white','black']
        const COLOR_NUM_CLASSES = COLOR_CLASSES.length;


        
        const model = tf.sequential();
        
        async function loadModel_0(){
            
            const xDataset = tf.data.array(xArray);
            const yDataset = tf.data.array(yArray);
            
            const xyDataset = tf.data.zip({xs: xDataset, ys: yDataset})
                            //.batch(4)
                            .shuffle(4);

            console.log(xyDataset);
            const learningRate = .1;
            const nEpochs = 20;
            const optimizer = tf.train.adam(learningRate)

            model.add(tf.layers.dense({units: 4, inputShape: [3], activation: 'sigmoid'}));
            //model.add(tf.layers.dense({units: 4, activation: 'softmax'}))
            //model.add(tf.layers.dense({units: 2, activation: 'softmax'}));
            //model.compile({optimizer: 'sgd', loss: 'meanSquaredError'});
            model.compile({optimizer: 'sgd', loss: 'categoricalCrossentropy', optimizer: optimizer});
            const history = await model.fitDataset(xyDataset, {
                epochs: nEpochs,
                callbacks: {onEpochEnd: async(epoch, logs) => {
                    console.log(logs.loss);
                    //await tf.nextFrame();
                }}
            });
            
            a = tf.tensor2d([1,1,1],[1,3])
            predicted_tensor = await model.predict(a).dataSync()[0];
            console.log('predicted value 1: '+ predicted_tensor);
            if(predicted_tensor < .5){
                console.log('black')
            }else{
                console.log('white')
            }
            //predicted_tensor2 = await model.predict([0,0,0],[1,3]).dataSync()[0];
            //console.log('predicted value 2: '+ predicted_tensor2);
        }

        function convertToTensors(data, targets, testSplit){
            const numExamples = data.length;
            if(numExamples !== targets.length){
                throw new Error('data and split have different numbers of examples');
            }

            const numTestExamples = Math.round(numExamples * testSplit);
            console.log({numTestExamples})
            const numTrainExamples = numExamples - numTestExamples;
            console.log({numTrainExamples})
            const xDims = data[0].length;
            console.log('xDims',xDims)

            //Create a 2D tf.tensor to hold the feature data
            const xs = tf.tensor2d(data, [numExamples, xDims]);

            //Create a 1d tf.Tensor to hold the labels and convert the number label
            //from the set {0,1} into one-hot encoding (e.g. 0 -> [1,0])
            const ys = tf.oneHot(tf.tensor1d(targets).toInt(), COLOR_NUM_CLASSES);

            //Split the data into training and test sets, using slice
            const xTrain = xs.slice([0,0], [numTrainExamples, xDims])
            const xTest = xs.slice([numTrainExamples, 0], [numTrainExamples, xDims]);
            const yTrain = ys.slice([0,0], [numTrainExamples, COLOR_NUM_CLASSES]);
            const yTest = ys.slice([0,0], [numTestExamples, COLOR_NUM_CLASSES]);
            return [xTrain, yTrain, xTest, yTest];
        }

        function getColorsData(testSplit){
            return tf.tidy(() => {
                const dataByClass = [];
                const targetsByClass = [];
                for(let i=0; i < COLOR_CLASSES.length; ++i){
                    dataByClass.push([]);
                    targetsByClass.push([]);
                }
                //debugger;
                for(const example of colorData){
                    const y = example[example.length - 1];
                    const x = example.slice(0, example.length - 1);
                    console.log({x},{y})
                    //dataByClass[y].push(x)
                    dataByClass[y].push(x)
                    targetsByClass[y].push(y)
                }
                console.log({dataByClass});
                console.log({targetsByClass});

                const xTrains = [];
                const yTrains = [];
                const xTests = [];
                const yTests = [];
                for (let i=0; i<COLOR_CLASSES.length; ++i){
                    const [xTrain, yTrain, xTest, yTest] = 
                        convertToTensors(dataByClass[i], targetsByClass[i], testSplit);
                    xTrains.push(xTrain);
                    yTrains.push(yTrain);
                    xTests.push(xTest);
                    yTests.push(yTest);
                }
                const concatAxis = 0;
                return [
                    tf.concat(xTrains, concatAxis), tf.concat(yTrains, concatAxis),
                    tf.concat(xTests, concatAxis), tf.concat(yTests, concatAxis)
                ];
            })
        }

        async function trainModel(xTrain, yTrain, xTest, yTest){
            debugger
            const model = tf.sequential();
            const learningRate = 0.01;
            const nEpochs = 40;
            
            const optimizer = tf.train.adam(learningRate);

            model.add(tf.layers.dense({units:1, inputShape: [0,3]}));
            model.add(tf.layers.dense({units:1, activation: 'softmax'}));
            model.compile({optimizer: optimizer, loss: 'categoricalCrossentropy', metrics: ['accuracy']});

            const history = await model.fit(xTrain, yTrain, 
            {
                epochs: nEpochs, 
                validationData: [xTest, yTest], 
                callbacks: {
                    onEpochEnd: async(epoch, logs) => {
                        console.log('epoch: '+ epoch + ' Logs: ' + logs.loss);
                        await tf.nextFrame();
                    }
                }
            });
            return model;
        }
        async function loadModel(){
            const [xTrain, yTrain, xTest, yTest] = getColorsData(.5);
            console.log({xTrain})
            console.log({yTrain})
            debugger
            model = await trainModel(xTrain, yTrain, xTest, yTest);
            //const input = tf.tensor2d([1,1,1], [1,3])
            //const prediction = model.predict(input)
            //print(prediction)
        }

        async function update(color){
            //Cuando hice el video, existia color.rgb
			//Ahora existe color.channels y dentro tiene varios componentes.
			//Aqui hacemos el objeto "rgb" para que sea similar al video
            var rgb = [color.channels.r, color.channels.g, color.channels.b];
            console.log(rgb);
            var divcolor = document.getElementById('color-zone');
            divcolor.style.background = color.toHEXString();

            //Tomar el fondo actual elegido por el usuario para usarlo de entrada
            //para que la red nos de su predicion del mejor color de texto a utilizar
            var entrada = {
                rojo: rgb[0]/255,
                verde: rgb[1]/255,
                azul: rgb[2]/255
            }
            
            //colores = [rgb[0]/255, rgb[1]/255, rgb[2]/255]
            colores = [1,1,1]

            //Obtener la prediccion de la red
            predicted_tensor = await model.predict(tf.tensor2d(colores,[1,3]));
            console.log(color_predicted)
            //color_predicted = predicted_tensor.dataSync()[0]
            //console.log('predicted value: '+ color_predicted);

            //imprimir la prediccion del color
            //console.log(resultado)
            /*if( color_predicted < .5){
                divcolor.style.color = 'white';
            } else{
                divcolor.style.color = 'black';
            }*/
        }

        loadModel_0()