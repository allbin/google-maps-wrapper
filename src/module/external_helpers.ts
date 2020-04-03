import proj4 from "proj4";
import { EARTH_RADIUS } from "./constants";

type Projection = "GMAPS" | "RT90" | "SWEREF99" | "WGS84";

////////////EXPORTED HELPER FUNCTIONS
//Check Map.helpers for usage.

/** Convert projection of points from 'fromProj' to 'toProj'. */
export type convertFromArrayOfArrayType = (
  fromProj: Projection,
  toProj: Projection,
  points: [number, number][]
) => [number, number][];
export const convertFromArrayOfArray: convertFromArrayOfArrayType = (
  fromProj,
  toProj,
  points
) => {
  return points.map((point) => proj4(fromProj, toProj, point));
};
export type arrayToLatLngObjectType = (
  coords: [number, number][],
  invert: boolean
) => LatLngLiteral[];

/** Convert coordinates to Google maps LatLngLiterals  */
export const arrayToLatLngObject: arrayToLatLngObjectType = (
  arr,
  invert = false
) =>
  invert
    ? arr.map((point) => ({ lat: point[1], lng: point[0] }))
    : arr.map((point) => ({ lat: point[0], lng: point[1] }));

export type latLngArrayToCoordArrayType = (
  latLngArray: LatLngLiteral[],
  invert: boolean
) => [number, number][];
/** Convert array of latlng to coordinates */
export const latLngArrayToCoordArray: latLngArrayToCoordArrayType = (
  arr,
  invert
) =>
  invert
    ? arr.map((point) => [point.lng, point.lat] as [number, number])
    : arr.map((point) => [point.lat, point.lng] as [number, number]);
/** Returns numberOfPoints around circle at p with r radius. */
export const makePointsAroundCircleRT90 = (
  point: number[],
  r: number,
  numberOfPoints: number
): [number, number][] => {
  const points = [];
  for (let i = 0; i < numberOfPoints; i += 1) {
    points.push([
      point[0] + r * Math.cos((2 * Math.PI * i) / numberOfPoints),
      point[1] + r * Math.sin((2 * Math.PI * i) / numberOfPoints),
    ] as [number, number]);
  }

  return points;
};
/** Create an RT90 rectangle from two points  */
export const makeRectRT90 = (
  p1: number[],
  p2: number[]
): [number, number][] => [
  [p1[0], p1[1]],
  [p2[0], p1[1]],
  [p2[0], p2[1]],
  [p1[0], p2[1]],
];
/** Move point by adding coordinates to point position  */
export const movePointsByCoord = (
  points_arr: [number, number][],
  coord: number[]
): [number, number][] =>
  points_arr.map(
    (point) => [point[0] + coord[0], point[1] + coord[1]] as [number, number]
  );

const squared = (x: number): number => x * x;
const toRad = (x: number): number => (x * Math.PI) / 180;
/** Calculates Haversine distance between two points on a sphere.*/
export const haversineDistance = (
  a: LatLngLiteral,
  b: LatLngLiteral
): number => {
  const aLat = a.lat;
  const bLat = b.lat;
  const aLng = a.lng;
  const bLng = b.lng;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLng - aLng);

  const f =
    squared(Math.sin(dLat / 2.0)) +
    Math.cos(toRad(aLat)) *
      Math.cos(toRad(bLat)) *
      squared(Math.sin(dLon / 2.0));
  const c = 2 * Math.atan2(Math.sqrt(f), Math.sqrt(1 - f));

  return EARTH_RADIUS * c;
};

export type MVCArrayToObjArrayType = (
  MVCArr: google.maps.MVCArray<google.maps.LatLng>
) => LatLngLiteral[];
/** Convert a google maps MVC Array to an array of LatLngLiterals */
export const MVCArrayToObjArray: MVCArrayToObjArrayType = (MVCArr) => {
  return MVCArr.getArray().map((gmapsLatLng) => {
    return {
      lat: gmapsLatLng.lat(),
      lng: gmapsLatLng.lng(),
    };
  });
};

export type MVCArrayToCoordArrayType = (
  MVCArr: google.maps.MVCArray<google.maps.LatLng>
) => number[][];

/** Convert a google maps MVC Array to an array of coordinates*/
export const MVCArrayToCoordArray: MVCArrayToCoordArrayType = (MVCArr) => {
  return MVCArr.getArray().map((gmapsLatLng) => {
    return [gmapsLatLng.lat(), gmapsLatLng.lng()];
  });
};
export const arrayRT90ToWGS84 = (
  rt90arr: [number, number][]
): [number, number][] => convertFromArrayOfArray("RT90", "WGS84", rt90arr);
/** Convert an array of rt90 coordinates to WGS84 */
export const arrayRT90ToWGS84LatLngObj = (
  rt90arr: [number, number][]
): LatLngLiteral[] =>
  arrayToLatLngObject(convertFromArrayOfArray("RT90", "WGS84", rt90arr), true);
