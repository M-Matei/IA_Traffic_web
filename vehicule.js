export class Vehicule {

    type = null ; // 'Voiture' or 'Camion'
    diameter = null ; // 6 or 9

    state  = 'Neutre'; // 'impatient' or 'furieux' or 'heureux' or 'accidente'
    position = 0; // sur la courbe de Bézier actuelle

    waitTime = 0;

    x = null;
    y = null;
    speed_max = null;


    step = 0 ; // position du véhicule sur la courbe actuelle
    stateCar = 'Neutre';  // État du conducteur
    colorCar = null; // Couleur en fonction de l'état du conducteur

    constructor(speed, mood, curve, type, speed_max){
        this.speed = speed;
        this.speed_max = speed_max;

        this.mood = mood;
        this.curve = curve;

        this.type = type ;
        if (type === 'Voiture') {
            this.diameter = 6 ;
        } else if (type === 'Camion') {
            this.diameter = 9 ;
        }
    }

    positionCoords(){
        let coord = this.curve.get(this.position);
        this.x = coord.x ;
        this.y = coord.y ;
        return [this.x, this.y];
    }

    // Énervé <=> Fatigué <=> Calme
    // Le conducteur devient impatient 3 unités de temps avant de devenir furieux
    waiting(mood, time){
      switch(mood){
          case 'Énervé':
          if(time > 5) {
              this.stateCar = 'Furieux';
              this.consoleLog = '-1 : Conducteur furieux...';
          } else if (time > 2) this.stateCar = 'Impatient';
          break;
          case 'Fatigué':
          if(time > 8) {
              this.stateCar = 'Furieux';
              this.consoleLog = '-1 : Conducteur furieux...';
          } else if (time > 5) this.stateCar = 'Impatient';
          break;
          case 'Calme':
          if (time > 12) {
              this.stateCar = 'Furieux'; 
              this.consoleLog = '-1 : Conducteur furieux...';
          } else if (time > 9) this.stateCar = 'Impatient';
          break;
      }

      if (this.stateCar === 'Furieux') this.errors = 1 ;
    }

    // changement de couleur du véhicule en fonction de son état
    colored(state){
        switch(state){
          case 'Neutre':
            this.colorCar = 'blue';
            break;
          case 'Impatient':
            this.colorCar = "pink";
            break;
          case 'Furieux':
            this.colorCar = "magenta";
            break;
          case 'Heureux':
            this.colorCar = "darkgreen";
            break;
          case "Accident":
            this.colorCar = "orange";
            break;
        }
    }

    speedVariation(game, feu){

      let speedCalculted = false ;

      // vitesse en fonction de la distance qui sépare du prochain feu
      const distancetoFeu = this.curve.split(this.step, feu.step);
      // fin de la courbe de Bézier = voie des véhicules-joueur
      const distance = this.curve.split(this.step, 1);

      if (distancetoFeu.length() <= 100 && this.step < feu.step - 10 ) {
        this.step += this.speed * (distance.length() / 100);
        game.consoleLog = 'Feu dans le champ de vision du conducteur !';
        speedCalculted = true ;
      }

      // vitesse en fonction de l'état du prochain feu (rouge, vert/jaune)
      
      // arrêt du véhicule au feu rouge
      if (distancetoFeu.length() <= 20 && feu.color === 'red') {
        this.step += 0 ;
        this.waitTime++;
        game.consoleLog = 'Votre véhicule est arrêté au feu, son conducteur patiente !';
        feu.trafficJam = 1 ;
        speedCalculted = true ;
      }

      // redémarrage après un arrêt au feu
      if (feu.color !== 'red' && distancetoFeu.length() <= 20) {
        this.speed = 0.05 ;
        this.step += this.speed;          
        this.waitTime = 0 ;
        feu.trafficJam = 0 ;
        feu.carsPassed++;
        game.consoleLog = 'Le véhicule a traversé le feu';
        speedCalculted = true ;
      } else if (feu.color === 'yellow' && feu.acurate === 'Nulle') {
          if (feu.carsPassed === 1){
            feu.color = 'red';
          }
      } else if (feu.color === 'yellow' && feu.acurate === 'Aléatoire') {
          if (feu.carsPassed === 1 && (Math.random() < 0.5)){
            feu.color = 'yellow';
          } else if (feu.carsPassed === 2){
            feu.color = 'red';
          }
      }

      // vitesse en fonction de la pente de la trajectoire
      const derivative = this.curve.derivative(this.step);
      const tangentX = derivative.x;
      const tangentY = derivative.y;
      const slope = tangentY / tangentX;

      // si la tangente à la trajectoire est trop pentue : ralentissement 
      if (
        (Math.abs(slope) > Math.tan(Math.PI / 6) && Math.abs(slope) < Math.tan(Math.PI / 3)) ||
        (Math.abs(slope) > Math.tan(2 * Math.PI / 3) && Math.abs(slope) < Math.tan(5 * Math.PI / 6)) ||
        (Math.abs(slope) > Math.tan(7 * Math.PI / 6) && Math.abs(slope) < Math.tan(4 * Math.PI / 3)) ||
        (Math.abs(slope) > Math.tan(5 * Math.PI / 3) && Math.abs(slope) < Math.tan(11 * Math.PI / 6))
      ) {
        this.step -= this.speed * 0.6;
        this.consoleLog = "Correction de la vitesse, trajectoire dangeureuse !";
        speedCalculted = true ;
      }

    // avancer de 1 unité de temps selon la vitesse
    if (distance.length() >= 10 && !speedCalculted) {
      this.step += this.speed;
    }
    
    if (distance.length() < 10 ){
      game.score = 1 ;
      game.consoleLog = '+1 : Conducteur heureux !';
    }    
  }

  checkCollisions(arrayBots){
    // if type of Both (vehicule-joueur && bot === 'Voiture')
    arrayBots.forEach((element) => {
      if (Math.abs(this.x - element.x) <= 5 && Math.abs(this.y-element.y <= 5 )){
        game.consoleLog = 'Collision!';
        game.errors++;
        game.score--;
        // this.endGame = true;
        this.colored('Accident');
        //this.drawPoint(middlePoint.x, middlePoint.y, 5, this.colorCar);
      }
    });
  }
}