/// <reference types="googlemaps" />
import WrappedMapBase, { ExportedFunctions, MapBaseProps } from "./WrappedMapBase";
export default WrappedMapBase;
export declare type GMW_ExportedFunctions = ExportedFunctions;
export declare type GMW_MapBaseProps = MapBaseProps;
export { convertFromArrayOfArray, haversineDistance, latLngArrayToCoordArray, makeRectRT90, movePointsByCoord, MVCArrayToCoordArray, MVCArrayToObjArray, arrayRT90ToWGS84, arrayRT90ToWGS84LatLngObj, } from "./external_helpers";
export declare type GMW_LatLng = google.maps.LatLng;
export declare type GMW_LatLngBounds = google.maps.LatLngBounds;
export declare type GMW_MouseEvent = google.maps.MouseEvent;
export interface GMW_LatLngLiteral {
    lat: number;
    lng: number;
}
export interface GMW_LatLngBoundsLiteral {
    north: number;
    east: number;
    south: number;
    west: number;
}
export declare type GMW_Polyline = google.maps.Polyline;
export declare type GMW_PolylineOptions = google.maps.PolylineOptions;
/**
 * Polyline collection must contain a default property.
 * Use Polyline.applyOptions('option_id') to apply one of the defined styles.
 * Use Polyline.setOptions(PolylineOptionsSet) to specify new options.
 */
export interface GMW_PolylineOptionsSet {
    default: GMW_PolylineOptions;
    [id: string]: GMW_PolylineOptions;
}
export declare type GMW_Polygon = google.maps.Polygon;
export declare type GMW_PolygonOptions = google.maps.PolygonOptions;
/**
 * Polygon collection must contain a default property.
 * Use Polygon.applyOptions('option_id') to apply one of the defined styles.
 * Use Polygon.setOptions(PolygonOptionsSet) to specify new options.
 */
export interface GMW_PolygonOptionsSet {
    default: GMW_PolygonOptions;
    [id: string]: GMW_PolygonOptions;
}
export declare type GMW_Marker = google.maps.Marker;
export declare type GMW_MarkerOptions = google.maps.MarkerOptions;
/**
 * Marker collection must contain a default property.
 * Use Marker.applyOptions('option_id') to apply one of the defined styles.
 * Use Marker.setOptions(MarkerOptionsSet) to specify new options.
 */
export interface GMW_MarkerOptionsSet {
    default: GMW_MarkerOptions;
    [id: string]: GMW_MarkerOptions;
}
export declare type GMW_Feature = google.maps.Data.Feature;
export declare type GMW_FeatureOptions = google.maps.Data.StyleOptions;
/**
 * Feature collection must contain a default property.
 * Use Feature.applyOptions('option_id') to apply one of the defined styles.
 * Use Feature.setOptions(PolylineOptionsSet) to specify new options.
 */
export interface GMW_FeatureOptionsSet {
    default: GMW_FeatureOptions;
    [id: string]: GMW_FeatureOptions;
}
export interface GMW_GeoJSONFeature<G extends GeoJSON.Geometry | null = GeoJSON.Geometry, P extends GeoJSON.GeoJsonProperties = null> extends GeoJSON.Feature<G, P> {
    id: string | number;
}
export interface GMW_GeoJSONFeatureCollection<G extends GeoJSON.Geometry | null = GeoJSON.Geometry, P = GeoJSON.GeoJsonProperties> extends GeoJSON.GeoJsonObject {
    type: "FeatureCollection";
    features: Array<GMW_GeoJSONFeature<G, P>>;
}
export declare type GMW_MarkerEvents = "click" | "mouseover" | "mouseout" | "mousedown" | "mouseup" | "dragstart" | "drag" | "dragend" | "dblclick" | "rightclick";
export declare type GMW_PolylineEvents = "click" | "dblclick" | "dragstart" | "drag" | "dragend" | "mouseover" | "mouseout" | "mousedown" | "mouseup" | "mousemove" | "rightclick" | "set_at" | "remove_at" | "insert_at";
export declare type GMW_PolygonEvents = "click" | "dblclick" | "dragstart" | "drag" | "dragend" | "mouseover" | "mouseout" | "mousedown" | "mouseup" | "mousemove" | "rightclick" | "set_at" | "remove_at" | "insert_at";
export declare type GMW_FeatureEvents = "click" | "mouseover" | "mouseout" | "mousedown" | "mouseup" | "rightclick";
export declare type GMW_DrawingCB = (path: [number, number][] | [number, number] | null, overlay: GMW_Polygon | GMW_Polyline | GMW_Marker) => void;
export interface GMW_WrappedGmapObj {
    gmaps_obj?: any;
    type: MapObjectType;
    show: () => void;
    hide: () => void;
    remove: () => void;
    /** **Do not modify this property**.
     * It is used internally to track event callbacks.
     * */
    _cbs: {
        [key: string]: (e?: any) => void;
    };
    registerEventCB: (event_type: GMW_MarkerEvents & GMW_PolygonEvents & GMW_PolylineEvents, cb: (e?: any) => void) => void;
    unregisterEventCB: (event_type: GMW_MarkerEvents & GMW_PolygonEvents & GMW_PolylineEvents) => void;
    options: any;
    selected_options_id: string;
    setOptions: (options: any) => Promise<GMW_WrappedGmapObj>;
    applyOptions: (options_id: string) => void;
    zoomTo: () => void;
    panTo: () => void;
}
export interface GMW_WrappedPolygon extends GMW_WrappedGmapObj {
    gmaps_obj: GMW_Polygon;
    type: "polygon";
    options: GMW_PolygonOptionsSet;
    setOptions: (options: GMW_PolygonOptionsSet) => Promise<GMW_WrappedPolygon>;
    applyOptions: (options_id: string) => void;
    registerEventCB: (event_type: GMW_PolygonEvents, cb: (e?: any) => void) => void;
    unregisterEventCB: (event_type: GMW_PolygonEvents) => void;
}
export interface GMW_WrappedPolyline extends GMW_WrappedGmapObj {
    gmaps_obj: GMW_Polyline;
    type: "polyline";
    options: GMW_PolylineOptionsSet;
    setOptions: (options: GMW_PolylineOptionsSet) => Promise<GMW_WrappedPolyline>;
    registerEventCB: (event_type: GMW_PolylineEvents, cb: (e?: any) => void) => void;
    unregisterEventCB: (event_type: GMW_PolylineEvents) => void;
}
export interface GMW_WrappedMarker extends GMW_WrappedGmapObj {
    gmaps_obj: GMW_Marker;
    type: "marker";
    options: GMW_MarkerOptionsSet;
    setOptions: (options: GMW_MarkerOptionsSet) => Promise<GMW_WrappedMarker>;
    registerEventCB: (event_type: GMW_MarkerEvents, cb: (e?: any) => void) => void;
    unregisterEventCB: (event_type: GMW_MarkerEvents) => void;
}
export interface GMW_WrappedFeature {
    gmaps_feature: google.maps.Data.Feature;
    options: GMW_FeatureOptionsSet;
    /** **Do not modify this property**
     * It is used internally to track visibility state of the feature.
     * */
    _visible: boolean;
    /** **Do not modify this property**
     * It is used internally to track event callbacks.
     * */
    _cbs: {
        [key: string]: (e: google.maps.Data.MouseEvent) => void;
    };
    /** **Do not modify this property**.
     * It is used internally for panTo and zoomTo operations.
     * */
    _bbox: google.maps.LatLngBounds;
    selected_options_id: string;
    show: () => void;
    hide: () => void;
    remove: () => void;
    setOptions: (options: GMW_FeatureOptionsSet) => Promise<GMW_WrappedFeature>;
    applyOptions: (options_id: string) => void;
    registerEventCB: (event_type: GMW_FeatureEvents, cb: (e: google.maps.Data.MouseEvent) => void) => void;
    unregisterEventCB: (event_type: GMW_FeatureEvents) => void;
    zoomTo: () => void;
    panTo: () => void;
}
export declare type MapObjectType = "polyline" | "polygon" | "marker";
export declare type GMW_Services = {
    geocoderService: google.maps.Geocoder;
    directionsService: google.maps.DirectionsService;
    drawing?: any;
    drawingManager?: any;
    places: google.maps.places.PlacesService;
};
declare global {
    interface Window {
        google: any;
    }
}
