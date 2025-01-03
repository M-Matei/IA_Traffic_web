function app() {

    return {

      // Object Game
      game : null,
      time: null,
      heureux: null,
      nbFails: null,
      mission:null,

      consoleLog: '', // message
      debugLog: '',
      chrono: 0,
      score: 0,
      mood: 'Grande',
      errors: 0,

      road: null, // voie des bots
      curve: null, // voie des véhicules-joueur

      endGame:false, // game over

      intervalBots: null,
      intervalCars: null,
      
      // ---------------------------------------------------

      canvas: null,
      ctx: null,   // contexte canvas

      speed : 0.5,

      feu: null,
      infosFeu: false,
      trafficJam: 0,
      acurate: 'Nulle',

      cars : [],
      bots : [],
      accidents : 0,

      // // déplacement en temps réel de manière fluide
      // lastTimestamp:0,


      // Fonction pour charger le module dynamiquement
      async loadModule() {
        try {
          const module = await import('./dist/utils.js');
          const bezierModule = await import('./dist/bezier-3.js');

          const gameModule = await import('./game.js')
          const Game = gameModule.Game ;
          return { Game } ;

        } catch (error) {
          console.log("Erreur lors du chargement des modules et des classes");
          console.error(error);
        }
      },  


      async init() {
        const modules = await this.loadModule();
        if (!modules) return;
        const { Game } = modules ;

        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');

        // voie véhicule joueur
        this.curve = new Bezier(200, 370, 200, 150, 700, 150);
        // voie véhicule non-joueur
        this.road = new Bezier(45, 150, 500, 150, 700, 150);

        this.time = 40;
        this.heureux = 2;
        this.nbFails = 4;
        this.game = new Game(this.heureux, this.nbFails, this.time, this.road, this.curve);
        this.mission = this.game.mission ;
        this.game.start();

        this.chrono = this.game.chrono ;

        this.drawCurve(this.curve);
        this.drawCurve(this.road);

        const feuModule = await import('./feu.js')
        const Feu = feuModule.Feu ;

        this.feu = new Feu(this.acurate, this.curve, 0.75, false);
        this.infosFeu = true ;

        let coordsFeu = this.feu.positionCoords(0);
        this.drawPoint(coordsFeu[0], coordsFeu[1], 7, this.feu.state);

        this.addObserver('feu.state');

        this.appearBot();
        this.intervalBots = setInterval(() => {
          this.appearBot();
        }, 1.2 * 1000);

        this.appearCar();
        this.intervalCars = setInterval(() => {
          this.appearCar();
        }, 2 * 1000);

        this.animate();
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
        this.ctx.strokeStyle = "white";
        this.ctx.lineWidth = 10;
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

      history(action) {
          var newAction = document.createElement('p');
          newAction.textContent = action;
      
          // Sélectionner l'élément parent où insérer le paragraphe
          var parent = document.querySelector('#scrollable-div');
      
          if (parent) {
            parent.appendChild(newAction);
            parent.scrollTop = parent.scrollHeight - parent.clientHeight;
          }
        
      },

      clearAccidents(){
        this.cars.forEach((car) => {
          if (car.state === 'Accident'){
            const index = this.cars.indexOf(car);
            if (index !== -1) {
              this.cars.splice(index, 1);
            }
          }
        });

        this.bots.forEach((element) => {
          if (element.state === 'accidente'){
            const index = this.bots.indexOf(element);
            if (index !== -1) {
              this.bots.splice(index, 1);
            }
          }
        });

        this.accidents = 0 ;
      },

      addObserver(propertyName) {
        this.$watch(propertyName, (value, oldValue) => {
            switch(propertyName){
              case 'feu.state': 
                this.drawPoint(this.feu.positionCoords(0)[0], this.feu.positionCoords(0)[1], 7, this.feu.state);
                this.history('feu.state : ' + oldValue + ' => ' + value);
                break;
            }
        });
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

      async appearBot(){        
        const botModule = await import('./bot.js');
        const Bot = botModule.Bot ;
        
        let botPoint = new Bot(0.5, this.road, 'Voiture', undefined);
        this.bots.push(botPoint);
      },

      async appearCar(){        
        const carModule = await import('./vehicule.js');
        const Vehicule = carModule.Vehicule ;
        
        let vehicule = new Vehicule(1/200, this.mood, this.curve, 'Voiture', undefined);
        this.cars.push(vehicule);
      },

      async animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawCurve(this.curve);
        this.drawCurve(this.road);

        this.chrono = this.game.chrono ;

        this.trafficJam = 0 ;
        this.cars.forEach((car) => {
          const numero = this.cars.indexOf(car);

          // Vérifie sur le comportement du véhicule précédent
          let vision = [-1, -1];
          if (numero !== 0) {
            vision = [this.cars[numero-1].lastVariation, this.cars[numero-1].step];
          }

          let infosCar = car.speedVariation(this.game, this.feu, vision, this.bots, this.accidents);
          if (infosCar[0] !== -1) {

            // renvoie l'état du conducteur en fonction du paramètre Humeur : temps d'attente avant changement d'état
            car.waiting(car.mood);

            // mise à jour de la position du point sur la courbe
            this.drawPoint(infosCar[0][0], infosCar[0][1], 4.5, car.colored());            
            
          } else {

            // si le véhicule arrive en fin de courbe de Bézier
            if (!car.furious) this.score++ ;
            if (numero !== -1) {
              this.cars.splice(numero, 1);
            }
          }

          // si le feu est rouge et que la voiture est arrêtée
          if (infosCar[2] === true) this.trafficJam++ ;
          if (car.state === 'Furieux' && !car.furious) {
              this.errors++ ;
              car.furious = true;
          }
          this.consoleLog = infosCar[1];

          // si une voiture passe au feu jaune alors le feu redevient rouge
          if (car.step > 0.76 && this.feu.state === 'yellow') this.feu.state = 'red';

        });

        this.bots.forEach((bot) => {
          let coordsBot = bot.drive();
          const index = this.bots.indexOf(bot);
          if (coordsBot !== -1) {
            this.drawPoint(coordsBot[0], coordsBot[1], 4.5, bot.colored());
          } else {
            if (index !== -1) {
              this.bots.splice(index, 1);
            }
          }
        });

        this.cars.forEach((car) => {
          this.bots.forEach((element) => {
            if (Math.abs(car.x - element.x) <= 10 && Math.abs(car.y-element.y <= 10 )){
              if (car.state !== 'Accident') {
                this.accidents++ ;
                this.errors++ ;
              }
              if (element.state !== 'accidente') {
                this.accidents++ ;
                this.errors++ ;
              }
              car.state = 'Accident';
              car.accidente = true ;
              element.state = 'accidente';
              
            }
          });
        });

        // mise à jour de l'état du feu tricolore
        this.drawPoint(this.feu.positionCoords()[0], this.feu.positionCoords()[1], 7, this.feu.state);

        this.endGame = this.game.isEndOfGame();
        if (this.trafficJam >= 15) this.endGame = true ;
        if (this.errors >= this.nbFails) this.endGame = true ;
        if (!this.endGame) {
          requestAnimationFrame(() => this.animate());
        } else if (this.endGame && this.score < this.heureux) {
          this.consoleLog = 'Fin de la partie : défaite !';
          this.history('endGame : false => true');
          clearInterval(this.intervalBots);
          clearInterval(this.intervalCars);
          this.game.stop();
        } else if (this.endGame && this.score >= this.heureux) {
          this.consoleLog = 'Fin de la partie : victoire !';
          this.history('endGame : false => true');
          clearInterval(this.intervalBots);
          clearInterval(this.intervalCars);
          this.game.stop();
        }
        
      }
    }
  }