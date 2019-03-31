import proj4 from 'proj4';
import { LatLngLiteral } from '.';


type Projection = "GMAPS" | "RT90" | "SWEREF99" | "WGS84";

const EARTH_RADIUS = 6378137;

////////////EXPORTED HELPER FUNCTIONS
//Check Map.helpers for usage.

export type convertFromArrayOfArray = (fromProj: Projection, toProj: Projection, points: [number, number][]) => [number, number][];
const convertFromArrayOfArray: convertFromArrayOfArray = (fromProj, toProj, points) => {
    return proj4(fromProj, toProj, points);
};

export type arrayToLatLngObject = (coords: [number, number][], invert: boolean) => LatLngLiteral[];
const arrayToLatLngObject: arrayToLatLngObject = (arr, invert = false) => {
    if (invert) {
        return arr.map((point) => {
            return { lat: point[1], lng: point[0] };
        });
    }
    return arr.map((point) => {
        return { lat: point[0], lng: point[1] };
    });
};

export type latLngArrayToCoordArray = (latLngArray: LatLngLiteral[], invert: boolean) => [number, number][];
const latLngArrayToCoordArray: latLngArrayToCoordArray = (arr, invert) => {
    if (invert) {
        return arr.map((point) => {
            return [point.lng, point.lat] as [number, number];
        });
    }
    return arr.map((point) => {
        return [point.lat, point.lng] as [number, number];
    });
};

export type makePointsAroundCircleRT90 = (p: number[], r: number, numberOfPoints: number) => [number, number][];
const makePointsAroundCircleRT90: makePointsAroundCircleRT90 = (point, r, numberOfPoints = 12) => {
    //Returns numberOfPoints around circle at p with r radius.

    let points = [];
    let i;

    for (i = 0; i < numberOfPoints; i += 1) {
        points.push([
            point[0] + r * Math.cos(2 * Math.PI * i / numberOfPoints),
            point[1] + r * Math.sin(2 * Math.PI * i / numberOfPoints)
        ] as [number, number]);
    }

    return points;
};

export type makeRectRT90 = (p1: number[], p2: number[]) => [number, number][];
const makeRectRT90: makeRectRT90 = (p1, p2) => {
    //p1 and p2 should be opposite corners of the rectangle.
    let points = [];

    points.push(
        [p1[0], p1[1]],
        [p2[0], p1[1]],
        [p2[0], p2[1]],
        [p1[0], p2[1]]
    );

    return points as [number, number][];
};

export type movePointsByCoord = (points_arr: [number, number][], coord: number[]) => [number, number][];
const movePointsByCoord: movePointsByCoord = (points_arr: [number, number][], coord: number[]) => {
    //Adds value of Coord to all points in array.
    return points_arr.map((point) => {
        return [point[0] + coord[0], point[1] + coord[1]] as [number, number];
    });
};


function squared(x: number): number { return x * x; }
function toRad(x: number): number { return x * Math.PI / 180; }
export type haversineDistance = (a: LatLngLiteral, b: LatLngLiteral) => number;
const haversineDistance: haversineDistance = (a, b) => {
    const aLat = a.lat;
    const bLat = b.lat;
    const aLng = a.lng;
    const bLng = b.lng;
    const dLat = toRad(bLat - aLat);
    const dLon = toRad(bLng - aLng);

    const f = squared(Math.sin(dLat / 2.0)) + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * squared(Math.sin(dLon / 2.0));
    const c = 2 * Math.atan2(Math.sqrt(f), Math.sqrt(1 - f));

    return EARTH_RADIUS * c;
};

export type MVCArrayToObjArray = (MVCArr: google.maps.MVCArray<google.maps.LatLng>) => LatLngLiteral[];
const MVCArrayToObjArray: MVCArrayToObjArray = (MVCArr) => {
    return MVCArr.getArray().map((gmapsLatLng) => {
        return {
            lat: gmapsLatLng.lat(),
            lng: gmapsLatLng.lng()
        };
    });
};

export type MVCArrayToCoordArray = (MVCArr: google.maps.MVCArray<google.maps.LatLng>) => number[][];
const MVCArrayToCoordArray: MVCArrayToCoordArray = (MVCArr) => {
    return MVCArr.getArray().map((gmapsLatLng) => {
        return [gmapsLatLng.lat(), gmapsLatLng.lng()];
    });
};

export default {
    MVCArrayToObjArray,
    MVCArrayToCoordArray,
    haversineDistance,
    convertFromArrayOfArray,
    latLngArrayToCoordArray,
    arrayToLatLngObject,
    makeRectRT90,
    movePointsByCoord,
    makePointsAroundCircleRT90,
};
