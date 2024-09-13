export class Bezier {
  constructor(x0, y0, x1, y1, x2, y2) {
    this.points = [x0, y0, x1, y1, x2, y2];
  }

  getPoints() {
    return this.points;
  }

  // Méthode pour obtenir un point sur la courbe à un paramètre t (0 <= t <= 1)
  getPointAt(t) {
    const [x0, y0, x1, y1, x2, y2] = this.getPoints();
    const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * x1 + t * t * x2;
    const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * y1 + t * t * y2;
    return { x, y };
  }
}
