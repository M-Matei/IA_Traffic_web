function app() {
    return {

      speed: 0.05,
      step: 0,
      curve: null,
      canvas: null,
      ctx: null,   
      road: null,  
      stepBot : 0,
      color: 'red',
      feuPoint: null,
      
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
          this.road = new Bezier(80, 300, 200, 300, 600, 300);
          this.animate();
        });
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
            this.drawPoint(this.feuPoint.x, this.feuPoint.y, 6, 'green');
            this.color = 'green';
        } else if (this.color === 'red' && type === 'simple') {
            this.drawPoint(this.feuPoint.x, this.feuPoint.y, 6, 'yellow');
            this.color = 'yellow';
        } else if (this.color === 'green' && type === 'simple') {
            this.drawPoint(this.feuPoint.x, this.feuPoint.y, 6, 'red');
            this.color = 'red';
        } else if (this.color === 'yellow' && type === 'simple'){
            this.drawPoint(this.feuPoint.x, this.feuPoint.y, 6, 'red');
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
        this.drawPoint(botPoint.x, botPoint.y, 6, "green");

        // Feu
        this.feuPoint = this.curve.get(0.8);
        this.drawPoint(this.feuPoint.x, this.feuPoint.y, 6, this.color);

        const middlePoint = this.curve.get(this.step);
        this.drawPoint(middlePoint.x, middlePoint.y, 6, "blue");

        let distancetoEnd = this.curve.split(this.step, 1);
        if (this.color === 'red') {
          distancetoEnd = this.curve.split(this.step, 0.8);
        }
        const distance = this.road.split(this.stepBot, 1);

        if (distancetoEnd.length() <= 20) {
          return;
        } else if (distancetoEnd.length() <= 100) {
          this.step += this.speed * (distancetoEnd.length() / 100);
          console.log("Approche d'un feu !");
        } else {
          this.step += this.speed ;
        }

        if (distance.length() >= 30 ) this.stepBot += this.speed;

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
          console.log("Correction de la vitesse");
        }
        await this.wait(1000);
        requestAnimationFrame(() => this.animate());
      }
    }
  }