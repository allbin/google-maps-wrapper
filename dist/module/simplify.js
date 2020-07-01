///////////////
//MODIFIED BY Joakim Johansson 2018
/*
 (c) 2017, Vladimir Agafonkin
 Simplify.js, a high-performance JS polyline simplification library
 mourner.github.io/simplify-js
*/
/** square distance between 2 points. */
const getSqDist = (p1, p2) => {
    const dx = p1[0] - p2[0];
    const dy = p1[1] - p2[1];
    return dx * dx + dy * dy;
};
/** square distance from a point to a segment. */
const getSqSegDist = (p, p1, p2) => {
    let x = p1[0];
    let y = p1[1];
    let dx = p2[0] - x;
    let dy = p2[1] - y;
    if (dx !== 0 || dy !== 0) {
        const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
        if (t > 1) {
            x = p2[0];
            y = p2[1];
        }
        else if (t > 0) {
            x += dx * t;
            y += dy * t;
        }
    }
    dx = p[0] - x;
    dy = p[1] - y;
    return dx * dx + dy * dy;
};
// rest of the code doesn't care about point format
/** basic distance-based simplification. */
const simplifyRadialDist = (points, sqTolerance) => {
    let prevPoint = points[0];
    const newPoints = [prevPoint];
    let point;
    for (let i = 1, len = points.length; i < len; i++) {
        point = points[i];
        if (getSqDist(point, prevPoint) > sqTolerance) {
            newPoints.push(point);
            prevPoint = point;
        }
    }
    if (prevPoint !== point) {
        newPoints.push(point);
    }
    return newPoints;
};
const simplifyDPStep = (points, first, last, sqTolerance, simplified) => {
    let maxSqDist = sqTolerance;
    let index = 0;
    for (let i = first + 1; i < last; i++) {
        const sqDist = getSqSegDist(points[i], points[first], points[last]);
        if (sqDist > maxSqDist) {
            index = i;
            maxSqDist = sqDist;
        }
    }
    if (maxSqDist > sqTolerance) {
        if (index - first > 1) {
            simplifyDPStep(points, first, index, sqTolerance, simplified);
        }
        simplified.push(points[index]);
        if (last - index > 1) {
            simplifyDPStep(points, index, last, sqTolerance, simplified);
        }
    }
};
/** simplification using Ramer-Douglas-Peucker algorithm. */
const simplifyDouglasPeucker = (points, sqTolerance) => {
    const last = points.length - 1;
    const simplified = [points[0]];
    simplifyDPStep(points, 0, last, sqTolerance, simplified);
    simplified.push(points[last]);
    return simplified;
};
/** both algorithms combined for awesome performance. */
const simplify = (points, tolerance, highestQuality) => {
    if (points.length <= 2) {
        return points;
    }
    const sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;
    points = highestQuality ? points : simplifyRadialDist(points, sqTolerance);
    points = simplifyDouglasPeucker(points, sqTolerance);
    return points;
};
export default simplify;
//# sourceMappingURL=simplify.js.map
