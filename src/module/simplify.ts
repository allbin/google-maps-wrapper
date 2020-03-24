///////////////
//MODIFIED BY Joakim Johansson 2018

/*
 (c) 2017, Vladimir Agafonkin
 Simplify.js, a high-performance JS polyline simplification library
 mourner.github.io/simplify-js
*/

// square distance between 2 points
function getSqDist(p1: [number, number], p2: [number, number]) {
  let dx = p1[0] - p2[0];
  let dy = p1[1] - p2[1];

  return dx * dx + dy * dy;
}

// square distance from a point to a segment
function getSqSegDist(
  p: [number, number],
  p1: [number, number],
  p2: [number, number]
) {
  let x = p1[0];
  let y = p1[1];
  let dx = p2[0] - x;
  let dy = p2[1] - y;

  if (dx !== 0 || dy !== 0) {
    let t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);

    if (t > 1) {
      x = p2[0];
      y = p2[1];
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }

  dx = p[0] - x;
  dy = p[1] - y;

  return dx * dx + dy * dy;
}

// rest of the code doesn't care about point format

// basic distance-based simplification
function simplifyRadialDist(points: [number, number][], sqTolerance: number) {
  let prevPoint = points[0];
  let newPoints = [prevPoint];
  let point;

  for (let i = 1, len = points.length; i < len; i++) {
    point = points[i];

    if (getSqDist(point, prevPoint) > sqTolerance) {
      newPoints.push(point);
      prevPoint = point;
    }
  }

  if (prevPoint !== point) {
    newPoints.push(point as [number, number]);
  }

  return newPoints;
}

function simplifyDPStep(
  points: [number, number][],
  first: number,
  last: number,
  sqTolerance: number,
  simplified: [number, number][]
) {
  let maxSqDist = sqTolerance;
  let index: number;

  for (let i = first + 1; i < last; i++) {
    let sqDist = getSqSegDist(points[i], points[first], points[last]);

    if (sqDist > maxSqDist) {
      index = i;
      maxSqDist = sqDist;
    }
  }

  if (maxSqDist > sqTolerance) {
    if (index! - first > 1) {
      simplifyDPStep(points, first, index, sqTolerance, simplified);
    }
    simplified.push(points[index]);
    if (last - index > 1) {
      simplifyDPStep(points, index, last, sqTolerance, simplified);
    }
  }
}

// simplification using Ramer-Douglas-Peucker algorithm
function simplifyDouglasPeucker(
  points: [number, number][],
  sqTolerance: number
) {
  let last = points.length - 1;

  let simplified = [points[0]];
  simplifyDPStep(points, 0, last, sqTolerance, simplified);
  simplified.push(points[last]);

  return simplified;
}

// both algorithms combined for awesome performance
export default function simplify(
  points: [number, number][],
  tolerance: number,
  highestQuality: boolean
) {
  if (points.length <= 2) {
    return points;
  }

  let sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;

  points = highestQuality ? points : simplifyRadialDist(points, sqTolerance);
  points = simplifyDouglasPeucker(points, sqTolerance);

  return points;
}
