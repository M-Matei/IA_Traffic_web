const Drawing = {
    drawCurve(ctx, bezier) {
      const [x0, y0, x1, y1, x2, y2] = bezier.getPoints();
    
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Nettoie le canevas
  
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo(x1, y1, x2, y2);
      ctx.stroke();
    },

    drawMovingPoint(ctx, bezier, t) {
        const { x, y } = bezier.getPointAt(t);
    
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI); // Dessine un cercle de rayon 5
        ctx.fillStyle = 'red';
        ctx.fill();
    },

    drawPoint(ctx, x, y) {
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI); // Dessine un cercle de rayon 5
        ctx.fillStyle = 'green';
        ctx.fill();
      }

  };
  
  export default Drawing;
  