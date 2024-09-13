import { Bezier } from "./dist/bezier-3.js"

window.onload = function () {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  // Fonction pour dessiner le squelette
  function drawSkeleton(curve) {
    const points = curve.points;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = "#aaa";
    ctx.stroke();
  }
  
  // Fonction pour dessiner la courbe
  function drawCurve(curve) {
    const points = curve.getLUT(); // Look Up Table pour obtenir les points de la courbe
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = "black";
    ctx.stroke();
  }

  function drawPoint(x, y, radius = 6, color = "red") {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
  }

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  let step = 0;

  async function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const curve = new Bezier(200, 550, 200, 300, 500, 300);
    drawSkeleton(curve);
    drawCurve(curve);

    // Feu
    drawPoint(500, 300);

    const middlePoint = curve.get(step);
    drawPoint(middlePoint.x, middlePoint.y,6,"blue");
  
    const distancetoEnd = curve.split(step, 1)

    if ((distancetoEnd.length() <= 20)) {
        return;
    } else if (distancetoEnd.length() <= 100){
        step += 0.05 * (distancetoEnd.length()/100);
        console.log("Approche d'un feu !");
    } else {
        step += 0.05;
    }
    
    const derivative = curve.derivative(step);
    const tangentX = derivative.x;
    const tangentY = derivative.y;

    const slope = tangentY / tangentX;

        if ((Math.abs(slope) > Math.tan(Math.PI / 6) && Math.abs(slope) < Math.tan(Math.PI / 3))
            || (Math.abs(slope) > Math.tan(2*Math.PI / 3) && Math.abs(slope) < Math.tan(5*Math.PI / 6))
            || (Math.abs(slope) > Math.tan(7*Math.PI / 6) && Math.abs(slope) < Math.tan(4*Math.PI / 3))
            || (Math.abs(slope) > Math.tan(5*Math.PI / 3) && Math.abs(slope) < Math.tan(11*Math.PI / 6))) {

                step -= 0.02;
                console.log("Correction de la vitesse");
        }

    await wait (1000);
    requestAnimationFrame(animate); // Appelle la fonction d'animation
  }

  animate(); // Démarre l'animation

 };

