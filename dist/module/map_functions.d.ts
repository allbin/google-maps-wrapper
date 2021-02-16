/// <reference types="googlemaps" />
import { GMW_LatLngLiteral, GMW_LatLng, GMW_MarkerOptionsSet, GMW_PolylineOptions, GMW_PolygonOptions, GMW_WrappedMarker, GMW_DrawingCB, GMW_Services, GMW_LatLngBoundsLiteral, GMW_LatLngBounds } from ".";
import { MapObjects, CuttingState, CuttingObjects } from "./WrappedMapBase";
interface DrawingListenerObject {
    listener?: google.maps.MapsEventListener;
    cancel: boolean;
}
interface CuttingListenerObject {
    listener?: (segments: [number, number][][] | null) => void;
    cancel: boolean;
}
export declare const getBoundsLiteral: (map: google.maps.Map | undefined) => undefined | {
    north: number;
    east: number;
    south: number;
    west: number;
};
export declare const getBounds: (map: google.maps.Map | undefined) => undefined | GMW_LatLngBounds;
/** Takes a coordinate and center it on the map  */
export declare const setCenter: (map: google.maps.Map | undefined, lat_lng: GMW_LatLngLiteral | GMW_LatLng) => Promise<void>;
export declare const setBounds: (map: google.maps.Map | undefined, bounds: GMW_LatLngBoundsLiteral | GMW_LatLngBounds) => Promise<void>;
export declare const toPixel: (lat_lng_input: GMW_LatLng | GMW_LatLngLiteral, html_element: any, overlay: google.maps.OverlayView | undefined) => [number, number];
export declare const setZoom: (zoom_level: number, map: google.maps.Map | undefined) => Promise<void>;
export declare const clearPolylines: (verbose: boolean, map_objects: MapObjects, cutting: CuttingState) => Promise<boolean[]>;
export declare const clearPolygons: (verbose: boolean, map_objects: MapObjects, cutting: CuttingState) => Promise<boolean[]>;
export declare const setMarker: (verbose: boolean, map: google.maps.Map, map_objects: MapObjects, cutting: CuttingState, id: string | number, options: GMW_MarkerOptionsSet) => Promise<GMW_WrappedMarker>;
export declare const clearMarkers: (verbose: boolean, map_objects: MapObjects, cutting: CuttingState) => Promise<boolean[]>;
export declare const clearFeatureCollections: (map_objects: MapObjects, features_layer: google.maps.Data, feature_layers: google.maps.Data[]) => void;
export declare const setDrawingMode: (services: GMW_Services, type: "polyline" | "polygon", opts: GMW_PolylineOptions | GMW_PolygonOptions, cb: GMW_DrawingCB, drawing_completed_listener: DrawingListenerObject) => void;
export declare const endDrawingMode: (services: GMW_Services, drawing_completed_listener: DrawingListenerObject, cancel: boolean, debug_src?: string | undefined) => void;
export declare const setCuttingMode: (services: GMW_Services, map: google.maps.Map, map_objects: MapObjects, cutting: CuttingState, cutting_objects: CuttingObjects, default_center: GMW_LatLngLiteral, drawing_completed_listener: DrawingListenerObject, polyline_id: string | number, cutting_completed_listener: CuttingListenerObject, cb?: ((segments: [number, number][][] | null) => void) | undefined) => void;
export declare const cuttingPositionUpdate: (mouse_event: google.maps.MouseEvent, map_objects: MapObjects, cutting: CuttingState, cutting_objects: CuttingObjects) => void;
export declare const cuttingClick: (mouse_event: google.maps.MouseEvent, map: google.maps.Map, map_objects: MapObjects, cutting: CuttingState, cutting_objects: CuttingObjects) => void;
export declare const completeCuttingMode: (map_objects: MapObjects, cutting: CuttingState, cutting_objects: CuttingObjects, cutting_completed_listener: CuttingListenerObject) => [number, number][][];
export declare const cancelCuttingMode: (map_objects: MapObjects, cutting: CuttingState, cutting_objects: CuttingObjects) => void;
export {};
