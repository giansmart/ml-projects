const canvas = document.getElementById("myCanvas");
canvas.width = 200;

const ctx = canvas.getContext("2d");
const road = new Road(canvas.width/2, canvas.width *.9);
const car = new Car(road.getLaneCenter(1),100,30,50,"MAIN");
const traffic = [
    new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY",2)
]
car.draw(ctx);

animate()

function animate(){
    for(let i=0; i<traffic.length; i++){
        traffic[i].update(road.borders,[]); //to avoid the car damages itself
    }
    car.update(road.borders, traffic);
    canvas.height = window.innerHeight;

    ctx.save();
    ctx.translate(0,-car.y + canvas.height * 0.7);

    road.draw(ctx);
    for(let i=0; i<traffic.length; i++){
        traffic[i].draw(ctx,"red");
    }
    car.draw(ctx,"blue");

    ctx.restore();
    requestAnimationFrame(animate);
}