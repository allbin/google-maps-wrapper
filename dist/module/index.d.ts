import WrappedMapBase, { ExportedFunctions as GMW_ExportedFunctions, MapBaseProps as GMW_MapBaseProps } from "./WrappedMapBase";
export default WrappedMapBase;
export { GMW_ExportedFunctions, GMW_MapBaseProps };
export { convertFromArrayOfArray, haversineDistance, latLngArrayToCoordArray, makeRectRT90, movePointsByCoord, MVCArrayToCoordArray, MVCArrayToObjArray, arrayRT90ToWGS84, arrayRT90ToWGS84LatLngObj, } from "./external_helpers";
export interface GMW_LatLngLiteral extends LatLngLiteral {
}
export interface GMW_LatLngBoundsLiteral extends LatLngBoundsLiteral {
}
export interface GMW_PolylineOptionsSet extends PolylineOptionsSet {
}
export declare type GMW_PolylineOptions = PolylineOptions;
export interface GMW_MarkerOptionsSet extends MarkerOptionsSet {
}
export declare type GMW_MarkerOptions = MarkerOptions;
export interface GMW_PolygonOptionsSet extends PolygonOptionsSet {
}
export declare type GMW_PolygonOptions = PolygonOptions;
export interface GMW_FeatureOptionsSet extends FeatureOptionsSet {
}
export declare type GMW_FeatureOptions = FeatureOptions;
export declare type GMW_MarkerEvents = MarkerEvents;
export declare type GMW_PolylineEvents = PolylineEvents;
export declare type GMW_PolygonEvents = PolygonEvents;
export declare type GMW_FeatureEvents = FeatureEvents;
export declare type GMW_DrawingCB = DrawingCB;
export interface GMW_WrappedPolygon extends WrappedPolygon {
}
export interface GMW_WrappedPolyline extends WrappedPolyline {
}
export interface GMW_WrappedMarker extends WrappedMarker {
}
export interface GMW_WrappedFeature extends WrappedFeature {
}
declare global {
    interface Window {
        google: any;
    }
}
