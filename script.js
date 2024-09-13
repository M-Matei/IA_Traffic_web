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

  const curve = new Bezier(200, 550, 200, 300, 500, 300);
  drawSkeleton(curve);
  drawCurve(curve);
  const feu = drawPoint(500, 300);


  const middlePoint = curve.get(0.5)
  drawPoint(middlePoint.x, middlePoint.y)

  const distancetoEnd = curve.split(0.5, 1)
  console.log(distancetoEnd.length())
  console.log(curve.length())
};
