/// <reference types="googlemaps" />
import { LatLngLiteral } from '.';
declare type Projection = "GMAPS" | "RT90" | "SWEREF99" | "WGS84";
export declare type convertFromArrayOfArray = (fromProj: Projection, toProj: Projection, points: [number, number][]) => [number, number][];
export declare type arrayToLatLngObject = (coords: [number, number][], invert: boolean) => LatLngLiteral[];
export declare type latLngArrayToCoordArray = (latLngArray: LatLngLiteral[], invert: boolean) => [number, number][];
export declare type makePointsAroundCircleRT90 = (p: number[], r: number, numberOfPoints: number) => [number, number][];
export declare type makeRectRT90 = (p1: number[], p2: number[]) => [number, number][];
export declare type movePointsByCoord = (points_arr: [number, number][], coord: number[]) => [number, number][];
export declare type haversineDistance = (a: LatLngLiteral, b: LatLngLiteral) => number;
export declare type MVCArrayToObjArray = (MVCArr: google.maps.MVCArray<google.maps.LatLng>) => LatLngLiteral[];
export declare type MVCArrayToCoordArray = (MVCArr: google.maps.MVCArray<google.maps.LatLng>) => number[][];
declare const _default: {
    MVCArrayToObjArray: MVCArrayToObjArray;
    MVCArrayToCoordArray: MVCArrayToCoordArray;
    haversineDistance: haversineDistance;
    convertFromArrayOfArray: convertFromArrayOfArray;
    latLngArrayToCoordArray: latLngArrayToCoordArray;
    arrayToLatLngObject: arrayToLatLngObject;
    makeRectRT90: makeRectRT90;
    movePointsByCoord: movePointsByCoord;
    makePointsAroundCircleRT90: makePointsAroundCircleRT90;
};
export default _default;
