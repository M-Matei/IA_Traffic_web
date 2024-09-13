export default function handleInteraction(cvs, movable, update) {
    const ctx = cvs.getContext("2d");
    let isMoving = false,
        mx = 0,
        my = 0,
        sx = 0,
        sy = 0,
        points,
        selectedPoint,
        selectedCurve;

    const isMouseNearPoint = (p) => Math.abs(mx - p.x) < 10 && Math.abs(my - p.y) < 10

    cvs.addEventListener("mousedown", (e) => {
        mx = e.offsetX;
        my = e.offsetY;

        if (movable.length > 1) {
            movable.forEach(c => {
                points = c.points;
                points.forEach(p => {
                    if (isMouseNearPoint(p)) {
                        isMoving = true;
                        selectedPoint = p; // pointer at curve's point
                        selectedCurve = c; // pointer at curve
                        sx = p.x;
                        sy = p.y;
                        return;
                    }
                })
            })
        } else {
            points = movable.points;
            points.forEach(p => {
                if (isMouseNearPoint(p)) {
                    isMoving = true;
                    selectedPoint = p; // pointer at curve's point
                    sx = p.x;
                    sy = p.y;
                    return;
                }
            })
        }
    })

    cvs.addEventListener("mousemove", (e) => {
        if (!isMoving) return;

        /* Update the coordinates of the selected point with the mouse
        coordinates, considering the initial offset. */

        /* Since selectedPoint is a pointer to the selected point (moved),
        the coordinates of the point in the selected curve are updated
        when selectedPoint is updated. */

        selectedPoint.x = sx + (e.offsetX - mx);
        selectedPoint.y = sy + (e.offsetY - my);
        selectedCurve ? selectedCurve.update() : movable.update();
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        update();
    })

    cvs.addEventListener("mouseup", (e) => {
        isMoving = false;
        selectedPoint = undefined;
        selectedCurve = undefined;
    })
}