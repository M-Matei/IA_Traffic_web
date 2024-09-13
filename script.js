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

  const curve = new Bezier(150,40 , 80,30 , 105,150);
  drawSkeleton(curve);
  drawCurve(curve);
};
