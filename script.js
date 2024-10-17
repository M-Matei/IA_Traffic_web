function app() {

    return {

      game:null, // Object Game
      canvas: null,
      ctx: null,   // contexte canvas

      // Gestion du temps qui s'écoule
      intervalID:null,
      chrono:0,
      startTime:0,

      errors:0, // Nombre d'accidents et de conducteurs furieux
      score:0, // Nombre de conducteurs heureux
      mission:'', // Texte mission non personnalisée

      road: null, // voie des bots
      curve: null, // voie des véhicules-joueur
      common:null, // voie commune

      consoleLog:'', // message 
      endGame:false, // game over

      feuPoint: null,

      // déplacement en temps réel de manière fluide
      lastTimestamp:0,


      // Fonction pour charger le module dynamiquement
      async loadModule() {
        try {
          const module = await import('./dist/utils.js');
          const bezierModule = await import('./dist/bezier-3.js');
        } catch (error) {
          console.log("Erreur lors du chargement du module");
          console.error(error);
        }
      },  


      init() {
        this.loadModule().then(() => {
            this.startTime = Date.now();

            this.canvas = document.getElementById('canvas');
            this.ctx = this.canvas.getContext('2d');

            // voie véhicule joueur
            this.curve = new Bezier(200, 370, 200, 150, 500, 150);
            // voie véhicule non-joueur
            this.road = new Bezier(80, 150, 500, 150, 500, 150);
            // voie commune en fin de niveau
            this.commun = new Bezier(500, 150, 500, 150, 700, 150);

            this.mission = 'Vous avez 40 secondes pour que 2 conducteurs rejoignent la fin du niveau !';

            this.game = new Game(this.mission, 40, this.road, this.curve, this.commun);

            this.animate();
            this.start();   
      })
      },

      
      /* Vérifier la construction d'une courbe de Bézier grâce à
        l'affichage du point de contrôle et des traits de construction
      drawSkeleton(curve) {
        const points = curve.points;
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          this.ctx.lineTo(points[i].x, points[i].y);
        }
        this.ctx.strokeStyle = "#aaa";
        this.ctx.stroke();
      },*/


      drawCurve(curve) {
        const points = curve.getLUT();
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          this.ctx.lineTo(points[i].x, points[i].y);
        }
        this.ctx.strokeStyle = "black";
        this.ctx.stroke();
      },
     
      drawPoint(x, y, radius = 5, color = "gray") {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = color;
        this.ctx.fill();
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
        //this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawCurve(this.curve);
        this.drawCurve(this.commun);

        // Dessine la route principale et un bot
        this.drawCurve(this.road);

        let botPoint = new Bot(0.5, this.road, 'Voiture', 0.05);
        let coords = botPoint.positionCoords();
        this.drawPoint(coords[0], coords[1], 5);

        const distanceBot = this.road.split(botPoint.position, 1);

        // Feu
        let feu = new Feu(this.acurate, this.curve, 0.8, false);
        let coordsFeu = feuPoint.positionCoords(0);
        this.drawPoint(coordsFeu[0], coordsFeu[1], 7, feuPoint.state);

        // 1ère voiture
        let car1 = new Vehicule(0.5, this.mood, this.curve, 'Voiture', 0.5);

        car1.waiting(car1.mood, car1.waitTime);
        car1.colored(car1.stateCar);
        this.drawPoint(car1.x, car1.y, 5, car1.colorCar);

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