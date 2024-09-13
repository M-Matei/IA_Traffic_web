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

  let t = 0;

  async function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const curve = new Bezier(200, 550, 200, 300, 500, 300);
    drawSkeleton(curve);
    drawCurve(curve);
    const feu = drawPoint(500, 300);
  
    t += 0.1;
    if (t > 1) t = 0;

    const middlePoint = curve.get(t)
    drawPoint(middlePoint.x, middlePoint.y)
  
    const distancetoEnd = curve.split(t, 1)

    if (distancetoEnd.length() <= 100) console.log("Je vois un feu !")

    await wait (1000);
    requestAnimationFrame(animate); // Appelle la fonction d'animation
  }

  animate(); // Démarre l'animation

 };

