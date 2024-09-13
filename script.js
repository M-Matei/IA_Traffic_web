import { Bezier } from "./dist/bezier.js";
import Drawing from "./dist/drawing.js";

window.onload = function () {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  // Créer une courbe de Bézier quadratique avec des points visibles
  const bezier = new Bezier(200, 550, 200, 300, 400, 300);

  let t = 0; // Paramètre pour positionner le point sur la courbe

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Nettoie le canevas

    // Dessiner la courbe
    Drawing.drawCurve(ctx, bezier);

    // Dessiner le point en mouvement
    Drawing.drawMovingPoint(ctx, bezier, t);
    Drawing.drawPoint(ctx, 400, 300);

    // Met à jour le paramètre t pour le mouvement
    t += 0.01;
    if (t > 1) t = 0; // Recommence le mouvement à la fin de la courbe

    requestAnimationFrame(animate); // Appelle la fonction d'animation
  }

  animate(); // Démarre l'animation

};
