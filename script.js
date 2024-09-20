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
          this.canvas = document.getElementById('canvas');
          this.ctx = this.canvas.getContext('2d');
          this.curve = new Bezier(200, 550, 200, 300, 500, 300);
          this.road = new Bezier(80, 300, 200, 300, 500, 300);
          this.waitTime = 0;
          this.animate();
        });
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
      },
                
      drawPoint(x, y, radius = 6, color = "gray") {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = color;
        this.ctx.fill();
      },

      async wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      },

      userClick(type){
        if (this.color === 'red' && type === 'double') {
            this.drawPoint(this.feuPoint.x, this.feuPoint.y, 8, 'green');
            this.color = 'green';
        } else if (this.color === 'red' && type === 'simple') {
            this.drawPoint(this.feuPoint.x, this.feuPoint.y, 8, 'yellow');
            this.color = 'yellow';
        } else if (this.color === 'green' && type === 'simple') {
            this.drawPoint(this.feuPoint.x, this.feuPoint.y, 8, 'red');
            this.color = 'red';
        } else if (this.color === 'yellow' && type === 'simple'){
            this.drawPoint(this.feuPoint.x, this.feuPoint.y, 8, 'red');
            this.color = 'red';
        }
      },

      async animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Dessine le squelette et la courbe
        this.drawSkeleton(this.curve);
        this.drawCurve(this.curve);

        // Dessine la route principale et un bot
        this.drawCurve(this.road);
        const botPoint = this.road.get(this.stepBot);
        this.drawPoint(botPoint.x, botPoint.y, 6);

        // Feu
        this.feuPoint = this.curve.get(0.8);
        this.drawPoint(this.feuPoint.x, this.feuPoint.y, 8, this.color);

        const middlePoint = this.curve.get(this.step-this.speed);
        let distancetoFeu = this.curve.split(this.step, 0.8);
        let distancetoEnd = this.curve.split(this.step, 1);

        const distanceBot = this.road.split(this.stepBot, 1);
        const distance = this.road.split(this.step, 1);

        if (distancetoFeu.length() <= 20 && this.color === 'red') {
          this.step += 0 ;
          this.waitTime++;
          this.consoleLog = 'Votre véhicule est arrêté au feu, son conducteur patiente !';
        } else if (distancetoFeu.length() <= 20 && this.color !== 'red') {
          this.consoleLog = 'Le véhicule a traversé de feu';
          this.speed = 0.05 ;
          this.step += this.speed;
          this.waitTime = 0 ;
        } else if (distancetoFeu.length() <= 100 && this.step < 0.8 ) {
          this.step += this.speed * (distancetoEnd.length() / 100);
          this.consoleLog = 'Approche du feu !';
        } else if (distance.length() >= 30 ) {
          this.step += this.speed;
        }

        this.waiting(this.mood, this.waitTime);
        this.colored(this.stateCar);
        this.drawPoint(middlePoint.x, middlePoint.y, 6, this.colorCar);

        if (distanceBot.length() >= 30 ) this.stepBot += this.speed;

        const derivative = this.curve.derivative(this.step);
        const tangentX = derivative.x;
        const tangentY = derivative.y;
        const slope = tangentY / tangentX;

        if (
          (Math.abs(slope) > Math.tan(Math.PI / 6) && Math.abs(slope) < Math.tan(Math.PI / 3)) ||
          (Math.abs(slope) > Math.tan(2 * Math.PI / 3) && Math.abs(slope) < Math.tan(5 * Math.PI / 6)) ||
          (Math.abs(slope) > Math.tan(7 * Math.PI / 6) && Math.abs(slope) < Math.tan(4 * Math.PI / 3)) ||
          (Math.abs(slope) > Math.tan(5 * Math.PI / 3) && Math.abs(slope) < Math.tan(11 * Math.PI / 6))
        ) {
          this.step -= this.speed * 0.6;
          this.consoleLog = "Correction de la vitesse";
        }
        await this.wait(1000);
        requestAnimationFrame(() => this.animate());
        // console.log(this.waitTime);
      }
    }
  }