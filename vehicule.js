export class Vehicule {

    type = null ; // 'Voiture' or 'Camion'
    diameter = null ; // 6 or 9

    state  = 'Neutre'; // 'impatient' or 'furieux' or 'heureux' or 'accidente'

    waitTime = 0;

    x = null;
    y = null;

    step = 0 ; // position du véhicule sur la courbe actuelle
    stateCar = 'Neutre';  // État du conducteur
    colorCar = null; // Couleur en fonction de l'état du conducteur
    passFeu = false;

    constructor(speed, mood, curve, type){

        this.speed = speed;

        this.mood = mood;
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
    colored(){
        switch(this.state){
          case 'Neutre':
            return this.colorCar = 'blue';
          case 'Impatient':
            return this.colorCar = "pink";
          case 'Furieux':
            return this.colorCar = "magenta";
          case 'Heureux':
            return this.colorCar = "darkgreen";
          case "Accident":
            return this.colorCar = "orange";
        }
    }

    speedVariation(game, feu){

      let speedCalculted = false ;
      let consoleLog = '';

      // vitesse en fonction de la distance qui sépare du prochain feu
      const distancetoFeu = this.curve.split(this.step, feu.position).length() ;
      // fin de la courbe de Bézier = voie des véhicules-joueur
      const distance = this.curve.split(this.step, 1).length() ;

      if (distancetoFeu <= 100 && this.step < feu.position - 10 ) {
        this.step += this.speed * (distance / 100);
        consoleLog += ' Feu dans le champ de vision du conducteur !';
        speedCalculted = true ;
      }

      // vitesse en fonction de l'état du prochain feu (rouge, vert/jaune)
      
      // arrêt du véhicule au feu rouge
      if (distancetoFeu < 20 && feu.state === 'red' && this.step <= 0.74) {
        this.step += 0 ;
        this.waitTime++;
        game.
        consoleLog += ' Votre véhicule est arrêté au feu, son conducteur patiente !';
        feu.trafficJam = 1 ;
        speedCalculted = true ;
      } else if (this.step > 0.76){
        this.speed = 0.5/100 ;
        this.step += this.speed;          
        this.waitTime = 0 ;
        feu.trafficJam = 0 ;
        this.passFeu ;
        consoleLog += ' Le véhicule a traversé le feu';
        speedCalculted = true ;
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
        // Calcul de la pondération en fonction de l'éloignement de l'angle idéal
        let angleDeviation = Math.abs(Math.atan(slope)); // Convertit la pente en angle
        let maxDeviation = Math.PI / 1.2; // L'angle critique maximal
        let penaltyFactor = Math.max(0, 1 - angleDeviation / maxDeviation); // Pondération proportionnelle

        this.step += this.speed * penaltyFactor; // Ajuste la vitesse proportionnellement
        consoleLog += " Correction de la vitesse, trajectoire dangeureuse !";
        speedCalculted = true ;
      }

    // avancer de 1 unité de temps selon la vitesse
    if (distance > 10 && !speedCalculted) {
      this.step += 0.5/100 ;
    }
    
    if (distance < 10 ){
      game.score = 1 ;
      consoleLog += ' +1 : Conducteur heureux !';
      return [-1, consoleLog];
    } 
    
    return [this.positionCoords(), consoleLog];
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