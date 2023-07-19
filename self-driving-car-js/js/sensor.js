class Sensor {
    constructor(car){
        this.car = car;
        this.rayCount = 5;
        this.rayLength = 150;
        this.raySpread = Math.PI/2; // 45 degrees
        this.rays = [];
        this.readings = [];
    }
    
    update(roadBorders){
        this.#castRays();

        this.readings = [];
        for(let i=0; i<this.rays.length; i++){
            this.readings.push(
                this.#getReading(this.rays[i],roadBorders)
            )
        }
    }

    #getReading(ray, roadBorders){
        let touches = [];
        for(let i=0; i<roadBorders.length; i++){
            const touch = getIntersection(
                ray[0],
                ray[1],
                roadBorders[i][0],
                roadBorders[i][1]
            );
            if (touch){
                touches.push(touch)
            }
        }

        if (touches.length == 0){
            return null; //there are not readings
        }else{
            const offsets = touches.map(e => e.offset);
            const minOffset = Math.min(...offsets);
            return touches.find(e => e.offset == minOffset);
        }
    }

    #castRays(){ //private method
        this.rays = [];
        for(let i=0; i<this.rayCount; i++){
            const rayAngle = lerp(
                this.raySpread/2,
                -this.raySpread/2,
                this.rayCount == 1? 0.5 :i / (this.rayCount - 1)
            ) + this.car.angle;

            const start = { x: this.car.x, y: this.car.y};
            const end = {
                x: this.car.x - Math.sin(rayAngle) * this.rayLength,
                y: this.car.y - Math.cos(rayAngle) * this.rayLength
            };
            this.rays.push([start,end])
            //console.log('update',this.rays)
        }
    }

    draw(ctx){
        
        for(let i=0; i<this.rayCount; i++){
           
            if(typeof this.rays[i] === "undefined"){
                console.log("null")
                continue;
            }
            else{
                let end = this.rays[i][1];
                if(this.readings[i]){
                    end = this.readings[i];
                }

                //console.log(this.rays[i][0].x)
                ctx.beginPath();
                ctx.lineWidth = 2;
                ctx.strokeStyle = "yellow";
                ctx.moveTo( // to draw start location
                    this.rays[i][0].x,
                    this.rays[i][0].y
                );
                ctx.lineTo( // to draw end location
                    end.x,
                    end.y
                );
                ctx.stroke();


                ctx.beginPath();
                ctx.lineWidth = 2;
                ctx.strokeStyle = "red";
                ctx.moveTo( // to draw start location
                    this.rays[i][1].x,
                    this.rays[i][1].y
                );
                ctx.lineTo( // to draw end location
                    end.x,
                    end.y
                );
                ctx.stroke();
            }
        }
    }
}
