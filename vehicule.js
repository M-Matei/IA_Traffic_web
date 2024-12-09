export class Vehicule {

    type = null ; // 'Voiture' or 'Camion'
    diameter = null ; // 6 or 9

    state  = 'Neutre'; // 'impatient' or 'furieux' or 'heureux' or 'accidente'

    waitTime = 0;

    x = null;
    y = null;

    step = 0 ; // position du véhicule sur la courbe actuelle
    passFeu = false;
    furious = false ;
    arret = false ;

    accidente = false ;

    lastVariation = null;

    constructor(speed, mood, curve, type, position){

      if (position === undefined) {
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

    // Énervé <=> Fatigué <=> Calme
    // Le conducteur devient impatient 3 unités de temps avant de devenir furieux
    waiting(mood){
      switch(mood){
          case 'Faible':
          if(this.waitTime > 100) {
              this.state = 'Furieux';
              this.consoleLog = '-1 : Conducteur furieux...';
          } else if (this.waitTime > 40) this.state = 'Impatient';
          break;
          case 'Moyenne':
          if(this.waitTime > 160) {
              this.state = 'Furieux';
              this.consoleLog = '-1 : Conducteur furieux...';
          } else if (this.waitTime > 100) this.state = 'Impatient';
          break;
          case 'Grande':
          if (this.waitTime > 240) {
              this.state = 'Furieux'; 
              this.consoleLog = '-1 : Conducteur furieux...';
          } else if (this.waitTime > 90) this.state = 'Impatient';
          break;
      }
    }

    // changement de couleur du véhicule en fonction de son état
    colored(){
        switch(this.state){
          case 'Neutre':
            return 'blue';
          case 'Impatient':
            return 'pink';
          case 'Furieux':
            return 'magenta';
          case 'Heureux':
            return 'darkgreen';
          case 'Accident':
            return 'orange';
        }
    }

    speedVariation(game, feu, vision){

      if (this.accidente) return [this.positionCoords(), 'Véhicule accidenté sur la voie', false];

      let speedCalculted = false ;
      let consoleLog = '';

      // vitesse en fonction de la distance qui sépare du prochain feu
      const distancetoFeu = this.curve.split(this.step, feu.position).length() ;
      // fin de la courbe de Bézier = voie des véhicules-joueur
      const distance = this.curve.split(this.step, 1).length() ;

      if (distancetoFeu <= 100 && this.step < feu.position - 10 ) {
        this.lastVariation = this.speed * (distance / 100);
        consoleLog += ' Feu dans le champ de vision du conducteur !';
        speedCalculted = true ;
      }

      // vitesse en fonction de l'état du prochain feu (rouge, vert/jaune)
      // arrêt du véhicule au feu rouge
      if (distancetoFeu < 20 && feu.state === 'red' && this.step <= 0.74) {
        this.speed = 0 ;
        this.lastVariation = 0 ;
        this.waitTime++;
        this.arret = true ;
        game.
        consoleLog += ' Votre véhicule est arrêté, son conducteur patiente !';
        feu.trafficJam = 1 ;
        speedCalculted = true ;
      } else if (this.step > 0.76){
        this.speed = 0.5/140 ;
        this.lastVariation = this.speed;          
        this.arret = false ;
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

        this.lastVariation = this.speed * penaltyFactor; // Ajuste la vitesse proportionnellement
        consoleLog += " Correction de la vitesse, trajectoire dangeureuse !";
        speedCalculted = true ;
      }

    // avancer de 1 unité de temps selon la vitesse
    if (distance > 10 && !speedCalculted) {
      this.lastVariation = 0.5/100 ;
      speedCalculted = true ;
    }

    // ajouter le déplacement pour évoluer sur la courbe en prenant en compte le véhicule de devant
    let simulateStep = this.step + this.lastVariation ;
    if (!(vision[0] === -1 && vision[1] === -1) && vision[1] - simulateStep <= 0.05) {
      // proche d'un véhicule mais vitesse supérieur à la sienne = correction
      if (this.lastVariation >= vision[0]) {
        this.lastVariation = vision[0];
        this.waitTime++ ;
      }
    }
    // application définitive de l'évolution sur la courbe
    this.step += this.lastVariation;

    if (distance < 10){
      game.score = 1 ;
      consoleLog += ' +1 : Conducteur heureux !';
      return [-1, consoleLog, this.arret];
    } 
    
    if (this.lastVariation === 0){
      this.arret = true ;
    }
    return [this.positionCoords(), consoleLog, this.arret];

  }

  clone(position){
    return new Vehicule(this.speed, this.mood, this.curve, this.type, position);
  }

  checkCollisions(arrayBots, accidents){

    if (accidents.length !== 0) {
      accidents.forEach((element) => {
        if (Math.abs(this.x - element.x) <= 10 && Math.abs(this.y-element.y <= 10 )){
          this.state = 'Accident';
          this.accidente = true ;
          return -1 ;
        }
      });
    }

    arrayBots.forEach((element) => {
      if (Math.abs(this.x - element.x) <= 10 && Math.abs(this.y-element.y <= 10 )){
        this.state = 'Accident';
        this.accidente = true ;
        const indexBot = arrayBots.indexOf(element);
        return indexBot ;
      }
    });

    return -2 ;
  }
}