/// <reference types="googlemaps" />
declare type Projection = "GMAPS" | "RT90" | "SWEREF99" | "WGS84";
/** Convert projection of points from 'fromProj' to 'toProj'. */
export declare type convertFromArrayOfArrayType = (fromProj: Projection, toProj: Projection, points: [number, number][]) => [number, number][];
export declare const convertFromArrayOfArray: convertFromArrayOfArrayType;
export declare type arrayToLatLngObjectType = (coords: [number, number][], invert: boolean) => LatLngLiteral[];
/** Convert coordinates to Google maps LatLngLiterals.  */
export declare const arrayToLatLngObject: arrayToLatLngObjectType;
export declare type latLngArrayToCoordArrayType = (latLngArray: LatLngLiteral[], invert: boolean) => [number, number][];
/** Convert array of latlng to coordinates. */
export declare const latLngArrayToCoordArray: latLngArrayToCoordArrayType;
/** Returns numberOfPoints around circle at p with r radius. */
export declare const makePointsAroundCircleRT90: (point: number[], r: number, numberOfPoints: number) => [number, number][];
/** Create an RT90 rectangle from two points. */
export declare const makeRectRT90: (p1: number[], p2: number[]) => [number, number][];
/** Move point by adding coordinates to point position. */
export declare const movePointsByCoord: (points_arr: [number, number][], coord: number[]) => [number, number][];
/** Calculates Haversine distance between two points on earth. Result in meter.*/
export declare const haversineDistance: (a: LatLngLiteral, b: LatLngLiteral) => number;
export declare type MVCArrayToObjArrayType = (MVCArr: google.maps.MVCArray<google.maps.LatLng>) => LatLngLiteral[];
/** Convert a google maps MVC Array to an array of LatLngLiterals. */
export declare const MVCArrayToObjArray: MVCArrayToObjArrayType;
export declare type MVCArrayToCoordArrayType = (MVCArr: google.maps.MVCArray<google.maps.LatLng>) => number[][];
/** Convert a google maps MVC Array to an array of coordinates. */
export declare const MVCArrayToCoordArray: MVCArrayToCoordArrayType;
export declare const arrayRT90ToWGS84: (rt90arr: [number, number][]) => [number, number][];
/** Convert an array of rt90 coordinates to WGS84. */
export declare const arrayRT90ToWGS84LatLngObj: (rt90arr: [number, number][]) => LatLngLiteral[];
export {};
