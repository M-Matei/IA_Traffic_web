function app() {
    return {

      speed: 0.05,
      step: 0,
      curve: null,
      canvas: null,
      ctx: null,        
      
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

      drawPoint(x, y, radius = 6, color = "red") {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = color;
        this.ctx.fill();
      },

      async wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      },

      async animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Dessine le squelette et la courbe
        this.drawSkeleton(this.curve);
        this.drawCurve(this.curve);

        // Feu
        this.drawPoint(500, 300);

        const middlePoint = this.curve.get(this.step);
        this.drawPoint(middlePoint.x, middlePoint.y, 6, "blue");

        const distancetoEnd = this.curve.split(this.step, 1);

        if (distancetoEnd.length() <= 20) {
          return;
        } else if (distancetoEnd.length() <= 100) {
          this.step += this.speed * (distancetoEnd.length() / 100);
          console.log("Approche d'un feu !");
        } else {
          this.step += this.speed ;
        }

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