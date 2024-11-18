export class Bot {

    type = null ; // 'Voiture' or 'Camion'
    diameter = null ; // 6 or 9

    state  = 'neutre'; // or 'accidente'

    step = 0 ;
    x = null;
    y = null;
    
    constructor(speed, curve, type){
        this.speed = speed;

        this.curve = curve;

        this.type = type ;
        if (type === 'Voiture') {
            this.diameter = 6 ;
        } else if (type === 'Camion') {
            this.diameter = 9 ;
        }

        this.positionCoords();
    }

    positionCoords(){
        let coord = this.curve.get(this.step);
        this.x = coord.x ;
        this.y = coord.y ;
        return [this.x, this.y];
    }

    drive(){
        if (this.step < 1) {
            this.step += 0.5/100;
            return this.positionCoords();
        } else {
            return -1;
        }
    }
}