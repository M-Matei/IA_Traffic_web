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
      accidents : [],

      // // déplacement en temps réel de manière fluide
      // lastTimestamp:0,


      // Fonction pour charger le module dynamiquement
      async loadModule() {
        try {
          const module = await import('./dist/utils.js');
          const bezierModule = await import('./dist/bezier-3.js');

          const gameModule = await import('/game.js')
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

        const feuModule = await import('/feu.js')
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
        this.accidents.forEach((voiture) => {
          const numero = this.accidents.indexOf(voiture);
          if (numero !== -1) {
            this.accidents.splice(numero, 1);
          }
        });
        this.accidents.splice(0, this.accidents.length);
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
        const botModule = await import('/bot.js');
        const Bot = botModule.Bot ;
        
        let botPoint = new Bot(0.5, this.road, 'Voiture');
        this.bots.push(botPoint);
      },

      async appearCar(){        
        const carModule = await import('/vehicule.js');
        const Vehicule = carModule.Vehicule ;
        
        let vehicule = new Vehicule(1/200, this.mood, this.curve, 'Voiture');
        this.cars.push(vehicule);
      },

      async animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawCurve(this.curve);
        this.drawCurve(this.road);

        this.chrono = this.game.chrono ;

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

          let collisionCar = bot.checkCollisions(this.accidents);
            if (collisionCar !== -2){
              this.bots[collisionCar].state = 'accidente';
              this.accidents.push(this.bots[index].clone(this.bots[index].step));
            }

        });

        this.trafficJam = 0 ;
        this.cars.forEach((car) => {
          const numero = this.cars.indexOf(car);
          let vision = [-1, -1];
          if (numero !== 0) {
            vision = [this.cars[numero-1].lastVariation, this.cars[numero-1].step];
          }
          let infosCar = car.speedVariation(this.game, this.feu, vision);
          if (infosCar[0] !== -1) {
            car.waiting(car.mood);
            this.drawPoint(infosCar[0][0], infosCar[0][1], 4.5, car.colored());
            
            let collisionCar = car.checkCollisions(this.bots, this.accidents);
            if (collisionCar !== -2){
              if (collisionCar === -1) {
                this.accidents.push(car.clone(car.step));
                if (numero !== -1) {
                  this.cars.splice(numero, 1);
                }
              } else {
                this.accidents.push(this.bots[collisionCar]);
                this.bots[collisionCar].state = 'accidente';
                this.accidents.push(car.clone(car.step));
                this.accidents.push(this.bots[collisionCar].clone(this.bots[collisionCar].step));

                if (numero !== -1) {
                  this.cars.splice(numero, 1);
                }
                if (collisionCar !== -1) {
                  this.bots.splice(collisionCar, 1);
                }
              }
            }

          } else {
            if (!car.furious) this.score++ ;
            if (numero !== -1) {
              this.cars.splice(numero, 1);
            }
          }

          if (infosCar[2] === true) this.trafficJam++ ;
          if (car.state === 'Furieux' && !car.furious) {
              this.errors++ ;
              car.furious = true;
          }
          this.consoleLog = infosCar[1];
          console.log(this.accidents);

          if (car.step > 0.76 && this.feu.state === 'yellow') this.feu.state = 'red';
      });

        this.drawPoint(this.feu.positionCoords()[0], this.feu.positionCoords()[1], 7, this.feu.state);

        // this.endGame = this.game.isEndOfGame();
        if (this.trafficJam >= 15) this.endGame = true ;
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