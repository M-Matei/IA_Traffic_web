export class Bot {

    type = null ; // 'Voiture' or 'Camion'
    diameter = null ; // 6 or 9

    state  = 'neutre'; // or 'accidente'

    step = 0 ;
    x = null;
    y = null;
    
    constructor(speed, curve, type, position){

        if (position === undefined) {
            this.speed = speed;

            this.curve = curve;

            this.type = type ;
            if (type === 'Voiture') {
                this.diameter = 6 ;
            } else if (type === 'Camion') {
                this.diameter = 9 ;
            }

            this.positionCoords();

        } else {

            this.speed = speed;

            this.mood = mood;
            this.curve = curve;

            this.type = type ;
            if (type === 'Voiture') {
                this.diameter = 6 ;
            } else if (type === 'Camion') {
                this.diameter = 9 ;
            }

            this.step = position ;
            this.positionCoords();

      }
    }

    positionCoords(){
        let coord = this.curve.get(this.step);
        this.x = coord.x ;
        this.y = coord.y ;
        return [this.x, this.y];
    }

    drive(){

        if (this.state === 'accidente'){
            return this.positionCoords();
        }

        if (this.step < 1) {
            this.step += 0.5/100;
            return this.positionCoords();
        } else {
            return -1;
        }
    }

    clone(position){
        return new Bot(this.speed, this.curve, this.type, position);
    }

    // changement de couleur du véhicule en fonction de son état
    colored(){
        switch(this.state){
          case 'neutre':
            return 'gray';
          case 'accidente':
            return 'orange';
        }
    }

}