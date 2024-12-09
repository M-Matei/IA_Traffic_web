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

    // changement de couleur du véhicule en fonction de son état
    colored(){
        switch(this.state){
          case 'neutre':
            return 'gray';
          case 'accidente':
            return 'orange';
        }
    }

    checkCollisions(accidents){
        if (accidents.length !== 0) {
          accidents.forEach((element) => {
            if (Math.abs(this.x - element.x) <= 10 && Math.abs(this.y-element.y <= 10 )){
              this.state = 'accidente';
              return -1 ;
            }
          });
        }
        return -2 ;
    }
}