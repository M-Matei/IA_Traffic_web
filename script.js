function app() {
    return {

      consoleLog:'',
      speed: 0.05,
      waitTime:null,
      step: 0,
      curve: null,
      curveStart:null,
      curveEnd: null,
      canvas: null,
      ctx: null,   
      road: null,  
      stepBot : 0,
      color: 'red',
      feuPoint: null,
      mood:'Calme',
      stateCar:'Neutre',
      colorCar:null,
      errors:0,
      carsPassed:0,
      trafficJam:0,
      acurate:'Nulle',
      score:0,
      mission:'',

      intervalID:null,
      chrono:0,
      startTime:0,

      // déplacement en temps réel de manière fluide
      lastTimestamp:0,
      endGame:false,

      // Fonction pour charger le module dynamiquement
      async loadModule() {
        try {
          // Utilisation de import() pour charger dynamiquement un module
          const module = await import('./dist/utils.js');
          const bezierModule = await import('./dist/bezier-3.js');
        } catch (error) {
          console.log("Erreur lors du chargement du module");
          console.error(error);
        }
      },      

      init() {
        this.loadModule().then(() => {
          // Capturer le temps de départ
            this.startTime = Date.now();

            this.canvas = document.getElementById('canvas');
            this.ctx = this.canvas.getContext('2d');
            this.curve = new Bezier(200, 550, 200, 300, 500, 300);
            this.road = new Bezier(80, 300, 200, 300, 500, 300);
            this.waitTime = 0;

            this.animate();
            this.mission = 'Vous avez 30 secondes pour que votre conducteur rejoigne la fin du niveau !';
            this.start();
        });
      },

      start() {
        // Assure-toi que l'intervalle n'est pas déjà en cours
        if (this.intervalID === null) {
            // Capture le temps de départ
            this.startTime = Date.now();

            // Démarrer l'intervalle avec une fonction fléchée
            this.intervalID = setInterval(() => {
                this.updateElapsedTime();
            }, 1000); // 1 seconde
        }
      },

      stop() {
          // Arrêter l'intervalle si un ID existe
          if (this.intervalID !== null) {
              clearInterval(this.intervalID);
              this.intervalID = null; // Réinitialiser l'ID
          }
      },

      updateElapsedTime() {
          // Calculer le temps écoulé en secondes
          const currentTime = Date.now();
          this.chrono = Math.floor((currentTime - this.startTime) / 1000);
          if (parseFloat(this.chrono) >= 10) {
            this.endGame = true ;
            this.stop();
          }
      },

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
      },

      drawSkeleton(curve) {
        const points = curve.points;
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          this.ctx.lineTo(points[i].x, points[i].y);
        }
        this.ctx.strokeStyle = "#aaa";
        this.ctx.stroke();
      },

      drawCurve(curve) {
        const points = curve.getLUT(); // Look Up Table pour obtenir les points de la courbe
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          this.ctx.lineTo(points[i].x, points[i].y);
        }
        this.ctx.strokeStyle = "black";
        this.ctx.stroke();
      },

      // Énervé <=> Fatigué <=> Calme = [5, 8, 12] unités de temps d'attente où le conducteur devient furieux
      // 3 unitès de temps avant il est impatient
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
      },
                
      drawPoint(x, y, radius = 6, color = "gray") {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = color;
        this.ctx.fill();
      },

      userClick(type){
        if (this.color === 'red' && type === 'double') {
            this.color = 'green';
        } else if (this.color === 'red' && type === 'simple') {
            this.color = 'yellow';
        } else if (this.color === 'green' && type === 'simple') {
            this.color = 'red';
        } else if (this.color === 'yellow' && type === 'simple'){
            this.color = 'red';
        }
        this.drawPoint(this.feuPoint.x, this.feuPoint.y, 8, this.color);
      },

      async wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      },

      // déplacement en temps réel de manière fluide
      // tick(timestamp) {
      //   if (!this.lastTimestamp) this.lastTimestamp = timestamp;
      //   this.deltaTime = timestamp - this.lastTimestamp;

      //   // Mettez à jour la position ou l'état en fonction de deltaTime
      //   this.animate(this.deltaTime);

      //   this.lastTimestamp = timestamp;
      //   if (!this.endGame) requestAnimationFrame((timestamp) => this.tick(timestamp));
      // },

      async animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Dessine le squelette et la courbe
        this.drawSkeleton(this.curve);
        this.drawCurve(this.curve);

        // Dessine la route principale et un bot
        this.drawCurve(this.road);
        const botPoint = this.road.get(0.95);
        this.drawPoint(botPoint.x, botPoint.y, 6);

        // Feu
        this.feuPoint = this.curve.get(0.8);
        this.drawPoint(this.feuPoint.x, this.feuPoint.y, 8, this.color);

        const middlePoint = this.curve.get(this.step-this.speed);
        let distancetoFeu = this.curve.split(this.step, 0.8);
        let distancetoEnd = this.curve.split(this.step, 1);

        const distanceBot = this.road.split(this.stepBot, 1);
        const distance = this.road.split(this.step, 1);

        // arrêt du véhicule au feu rouge
        if (distancetoFeu.length() <= 20 && this.color === 'red') {
          this.step += 0 ;
          this.waitTime++;
          this.consoleLog = 'Votre véhicule est arrêté au feu, son conducteur patiente !';
          this.trafficJam = 1 ;

        // redémarrage après un arrêt au feu
        } else if (this.color !== 'red' && distancetoFeu.length() <= 20) {
          this.speed = 0.05 ;
          this.step += this.speed;          
          this.waitTime = 0 ;
          this.trafficJam = 0 ;
          this.carsPassed++;
          this.consoleLog = 'Le véhicule a traversé le feu';
          if (this.color === 'yellow' && this.acurate === 'Nulle') {
            if (this.carsPassed === 1){
              this.color = 'red';
            }
          } else if (this.color === 'yellow' && this.acurate === 'Aléatoire') {
            if (this.carsPassed === 1 && (Math.random() < 0.5)){
              this.color = 'yellow';
            } else if (this.carsPassed === 2){
              this.color = 'red';
            }
          }

        // approche d'un feu : vision du conducteur pour déccélerer  
        } else if (distancetoFeu.length() <= 100 && this.step < 0.7) {
          this.step += this.speed * (distancetoEnd.length() / 100);
          this.consoleLog = 'Approche du feu !';

        // avancer de 1 unité de temps selon la vitesse
        } else if (distance.length() >= 10 ) {
          this.step += this.speed;
        } else if (distance.length() < 10 ){
          this.score++;
          this.consoleLog = '+1 : Conducteur heureux !';
        }

        this.waiting(this.mood, this.waitTime);
        this.colored(this.stateCar);
        this.drawPoint(middlePoint.x, middlePoint.y, 6, this.colorCar);

        if (distanceBot.length() >= 30 ) this.stepBot += this.speed/2;

        const derivative = this.curve.derivative(this.step);
        const tangentX = derivative.x;
        const tangentY = derivative.y;
        const slope = tangentY / tangentX;

        // tangente de la trajectoire trop pentu : ralentissment 
        if (
          (Math.abs(slope) > Math.tan(Math.PI / 6) && Math.abs(slope) < Math.tan(Math.PI / 3)) ||
          (Math.abs(slope) > Math.tan(2 * Math.PI / 3) && Math.abs(slope) < Math.tan(5 * Math.PI / 6)) ||
          (Math.abs(slope) > Math.tan(7 * Math.PI / 6) && Math.abs(slope) < Math.tan(4 * Math.PI / 3)) ||
          (Math.abs(slope) > Math.tan(5 * Math.PI / 3) && Math.abs(slope) < Math.tan(11 * Math.PI / 6))
        ) {
          this.step -= this.speed * 0.6;
          this.consoleLog = "Correction de la vitesse";
        }

        if (Math.abs(middlePoint.x - botPoint.x) <= 5 && Math.abs(middlePoint.y-botPoint.y <= 5 )){
          this.consoleLog = 'Collision!';
          this.score--;
          this.endGame = true;
        }

        // if (Math.abs(this.step - this.stepBot) <= 10) {
        //   this.endGame = true ;
        // }

        await this.wait(400);

        if (!this.endGame) {
          requestAnimationFrame(() => this.animate());
        } else if (this.endGame && this.score < 1) {
          this.consoleLog = 'Fin de la partie : défaite!';
          this.stop();
        } else if (this.endGame && this.score !== 0) {
          this.consoleLog = 'Fin de la partie : victoire!';
          this.stop();
        }
      }
    }

  }