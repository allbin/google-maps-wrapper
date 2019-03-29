import proj4 from 'proj4';
import { LatLngLiteral } from '.';


type Projection = "GMAPS" | "RT90" | "SWEREF99" | "WGS84";

const EARTH_RADIUS = 6378137;

////////////EXPORTED HELPER FUNCTIONS
//Check Map.helpers for usage.

function convertFromArrayOfArray(fromProj: Projection, toProj: Projection, points: [number, number][]) : number[][] {
    return proj4(fromProj, toProj, points);
}

function arrayToLatLngObject(arr: [number, number][], invert: boolean = false): LatLngLiteral[] {
    if (invert) {
        return arr.map((point) => {
            return { lat: point[1], lng: point[0] };
        });
    }
    return arr.map((point) => {
        return { lat: point[0], lng: point[1] };
    });
}
function latLngArrayToArrayOfArrays(arr: LatLngLiteral[], invert: boolean): [number, number][] {
    if (invert) {
        return arr.map((point) => {
            return [point.lng, point.lat] as [number, number];
        });
    }
    return arr.map((point) => {
        return [point.lat, point.lng] as [number, number];
    });
}


function makePointsAroundCircleRT90(p: number[], r: number, numberOfPoints = 12): number[][] {
    //Returns numberOfPoints around circle at p with r radius.

    let points = [];
    let i;

    for (i = 0; i < numberOfPoints; i += 1) {
        points.push([
            p[0] + r * Math.cos(2 * Math.PI * i / numberOfPoints),
            p[1] + r * Math.sin(2 * Math.PI * i / numberOfPoints)
        ]);
    }

    return points;
}

function makeRectRT90(p1: number[], p2: number[]): number[][] {
    //TODO: Chamfer.
    //p1 and p2 should be opposite corners of the rectangle.
    let points = [];

    points.push(
        [p1[0], p1[1]],
        [p2[0], p1[1]],
        [p2[0], p2[1]],
        [p1[0], p2[1]]
    );

    return points;
}

function movePointsByCoord(points_arr: [number, number][], coord: number[]) {
    //Adds value of Coord to all points in array.
    return points_arr.map((point) => {
        return [point[0] + coord[0], point[1] + coord[1]];
    });
}

function squared(x: number): number { return x * x; }
function toRad(x: number): number { return x * Math.PI / 180; }
function haversineDistance(a: LatLngLiteral, b: LatLngLiteral) : number {
    const aLat = a.lat;
    const bLat = b.lat;
    const aLng = a.lng;
    const bLng = b.lng;
    const dLat = toRad(bLat - aLat);
    const dLon = toRad(bLng - aLng);

    const f = squared(Math.sin(dLat / 2.0)) + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * squared(Math.sin(dLon / 2.0));
    const c = 2 * Math.atan2(Math.sqrt(f), Math.sqrt(1 - f));

    return EARTH_RADIUS * c;
}

function MVCArrayToObjArray(MVCArr: google.maps.MVCArray<google.maps.LatLng>): LatLngLiteral[] {
    return MVCArr.getArray().map((gmapsLatLng) => {
        return {
            lat: gmapsLatLng.lat(),
            lng: gmapsLatLng.lng()
        };
    });
}

function MVCArrayToCoordArray(MVCArr: google.maps.MVCArray<google.maps.LatLng>): number[][] {
    return MVCArr.getArray().map((gmapsLatLng) => {
        return [gmapsLatLng.lat(), gmapsLatLng.lng()];
    });
}

export default {
    MVCArrayToObjArray,
    MVCArrayToCoordArray,
    haversineDistance,
    convertFromArrayOfArray,
    latLngArrayToArrayOfArrays,
    arrayToLatLngObject,
    makeRectRT90,
    movePointsByCoord,
    makePointsAroundCircleRT90,
}
