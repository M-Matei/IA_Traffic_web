export class Bot {

    type = null ; // 'Voiture' or 'Camion'
    diameter = null ; // 6 or 9

    state  = 'neutre'; // or 'accidente'

    x = null;
    y = null;
    speed_max = null;
    
    constructor(speed, curve, type, speed_max){
        this.speed = speed;
        this.speed_max = speed_max;

        this.curve = curve;

        this.type = type ;
        if (type === 'Voiture') {
            this.diameter = 6 ;
        } else if (type === 'Camion') {
            this.diameter = 9 ;
        }

        this.positionCoords(0);

    }

    positionCoords(step){
        this.step = step ;
        let coord = this.curve.get(this.step);
        this.x = coord.x ;
        this.y = coord.y ;
        return [this.x, this.y];
    }

    drive(){
        this.stepBot += this.speed/2;
    }

}