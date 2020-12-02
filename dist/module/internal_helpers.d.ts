/// <reference types="googlemaps" />
import { GMW_LatLng, GMW_LatLngBoundsLiteral, GMW_LatLngLiteral, GMW_PolylineOptionsSet, GMW_PolygonOptionsSet, GMW_MarkerOptionsSet, GMW_WrappedPolyline, GMW_WrappedPolygon, GMW_WrappedMarker, GMW_WrappedFeature, GMW_MapObjectType, GMW_WrappedGmapObj, GMW_AllMapObjEvents } from ".";
import { MapObjects, CuttingState } from "./WrappedMapBase";
declare type AnyObjectOptionsSet = GMW_MarkerOptionsSet | GMW_PolylineOptionsSet | GMW_PolygonOptionsSet;
export declare const fromLatLngToPixel: (map: google.maps.Map, latLng: GMW_LatLng) => any;
export declare const fitToBoundsOfArray: (map: google.maps.Map, arr_of_coords: [number, number][]) => Promise<void>;
export declare const fitToBoundsLiteral: (bounds: GMW_LatLngBoundsLiteral, map?: google.maps.Map | undefined) => Promise<void>;
export declare const fitToBoundsOfObjectArray: (arr_of_latlngliteral: GMW_LatLngLiteral[], map?: google.maps.Map | undefined) => Promise<void>;
export declare const setPolyline: (verbose: boolean, map: google.maps.Map, map_objects: MapObjects, cutting: CuttingState, id: string | number, options: GMW_PolylineOptionsSet) => Promise<GMW_WrappedPolyline>;
export declare const setPolygon: (verbose: boolean, map: google.maps.Map, map_objects: MapObjects, cutting: CuttingState, id: string | number, options: GMW_PolygonOptionsSet) => Promise<GMW_WrappedPolygon>;
export declare const setMarker: (verbose: boolean, map: google.maps.Map, map_objects: MapObjects, cutting: CuttingState, id: string | number, options: GMW_MarkerOptionsSet) => Promise<GMW_WrappedMarker>;
declare type setMapObject = (verbose: boolean, map: google.maps.Map, map_objects: MapObjects, cutting: CuttingState, type: GMW_MapObjectType, id: string | number, options: AnyObjectOptionsSet, current_options_id?: string) => Promise<GMW_WrappedPolyline | GMW_WrappedPolygon | GMW_WrappedMarker>;
export declare const setMapObject: setMapObject;
export declare const unsetMapObject: (verbose: boolean, map_objects: MapObjects, cutting: CuttingState, type: GMW_MapObjectType, id: string | number) => Promise<boolean>;
export declare const mapObjectEventCB: (cutting: CuttingState, map_obj: GMW_WrappedGmapObj, event_type: GMW_AllMapObjEvents, e: any) => boolean;
export declare const panZoomToObjectOrFeature: (map: google.maps.Map, obj: GMW_WrappedMarker | GMW_WrappedPolygon | GMW_WrappedPolyline | GMW_WrappedFeature, zoom?: boolean) => void;
export {};
