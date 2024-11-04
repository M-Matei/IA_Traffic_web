export class Feu {

    state = 'red'; // or 'green' or 'yellow'
    trafficJam = 0 ;
    carsPassed = 0 ; // Nombre de véhicules passés au jaune

    constructor(behavior, curve, position, assist){
        this.behavior = behavior ; // Probabilité que 2 véhicules passent au jaune

        this.curve = curve ;
        this.position = position;

        this.assist_IA = assist ;
    }

    positionCoords(){
        let coord = this.curve.get(this.position);
        this.x = coord.x ;
        this.y = coord.y ;
        return [this.x, this.y];
    }

    // gestion de la couleur du feu
    userClick(type){
        if (this.state === 'red' && type === 'doubleClick') {
            this.state = 'green';
        } else if (this.state === 'red' && type === 'simpleClick') {
            this.state = 'yellow';
        } else if (this.state === 'green' && type === 'simpleClick') {
            this.state = 'red';
        } else if (this.state === 'yellow' && type === 'simpleClick'){
            this.state = 'red';
        }
    }
}