import proj4 from "proj4";
const EARTH_RADIUS = 6378137;
export const convertFromArrayOfArray = (fromProj, toProj, points) => {
    return points.map((point) => proj4(fromProj, toProj, point));
};
export const arrayToLatLngObject = (arr, invert = false) => invert
    ? arr.map((point) => ({ lat: point[1], lng: point[0] }))
    : arr.map((point) => ({ lat: point[0], lng: point[1] }));
export const latLngArrayToCoordArray = (arr, invert) => invert
    ? arr.map((point) => [point.lng, point.lat])
    : arr.map((point) => [point.lat, point.lng]);
export const makePointsAroundCircleRT90 = (point, r, numberOfPoints) => {
    //Returns numberOfPoints around circle at p with r radius.
    const points = [];
    let i;
    for (i = 0; i < numberOfPoints; i += 1) {
        points.push([
            point[0] + r * Math.cos((2 * Math.PI * i) / numberOfPoints),
            point[1] + r * Math.sin((2 * Math.PI * i) / numberOfPoints),
        ]);
    }
    return points;
};
export const makeRectRT90 = (p1, p2) => {
    //p1 and p2 should be opposite corners of the rectangle.
    const points = [];
    points.push([p1[0], p1[1]], [p2[0], p1[1]], [p2[0], p2[1]], [p1[0], p2[1]]);
    return points;
};
export const movePointsByCoord = (points_arr, coord) => points_arr.map((point) => [point[0] + coord[0], point[1] + coord[1]]);
const squared = (x) => x * x;
const toRad = (x) => (x * Math.PI) / 180;
export const haversineDistance = (a, b) => {
    const aLat = a.lat;
    const bLat = b.lat;
    const aLng = a.lng;
    const bLng = b.lng;
    const dLat = toRad(bLat - aLat);
    const dLon = toRad(bLng - aLng);
    const f = squared(Math.sin(dLat / 2.0)) +
        Math.cos(toRad(aLat)) *
            Math.cos(toRad(bLat)) *
            squared(Math.sin(dLon / 2.0));
    const c = 2 * Math.atan2(Math.sqrt(f), Math.sqrt(1 - f));
    return EARTH_RADIUS * c;
};
export const MVCArrayToObjArray = (MVCArr) => {
    return MVCArr.getArray().map((gmapsLatLng) => {
        return {
            lat: gmapsLatLng.lat(),
            lng: gmapsLatLng.lng(),
        };
    });
};
export const MVCArrayToCoordArray = (MVCArr) => {
    return MVCArr.getArray().map((gmapsLatLng) => {
        return [gmapsLatLng.lat(), gmapsLatLng.lng()];
    });
};
export const arrayRT90ToWGS84 = (rt90arr) => convertFromArrayOfArray("RT90", "WGS84", rt90arr);
export const arrayRT90ToWGS84LatLngObj = (rt90arr) => arrayToLatLngObject(convertFromArrayOfArray("RT90", "WGS84", rt90arr), true);
//# sourceMappingURL=external_helpers.js.map
