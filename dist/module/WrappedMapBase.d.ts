/// <reference types="googlemaps" />
import React from "react";
import MarkerClusterer, { MarkerClustererOptions } from "@google/markerclustererplus";
import { GMW_LatLngBoundsLiteral, GMW_LatLngLiteral, GMW_LatLng, GMW_PolylineOptionsSet, GMW_PolygonOptionsSet, GMW_MarkerOptionsSet, GMW_PolylineOptions, GMW_PolygonOptions, GMW_WrappedPolyline, GMW_WrappedPolygon, GMW_WrappedMarker, GMW_FeatureOptionsSet, GMW_WrappedFeature, GMW_DrawingCB, GMW_Services } from ".";
export declare type ExportedFunctions = {
    getBoundsLiteral: () => GMW_LatLngBoundsLiteral | undefined;
    setCenter: (lat_lng: GMW_LatLngLiteral | GMW_LatLng) => Promise<void>;
    toPixel: (lat_lng_pixel: GMW_LatLng | GMW_LatLngLiteral) => [number, number];
    setZoom: (zoom_level: number) => Promise<void>;
    setPolyline: (id: string | number, options: GMW_PolylineOptionsSet) => Promise<GMW_WrappedPolyline>;
    setPolygon: (id: string | number, options: GMW_PolygonOptionsSet) => Promise<GMW_WrappedPolygon>;
    unsetPolyline: (id: string | number) => Promise<boolean>;
    unsetPolygon: (id: string | number) => Promise<boolean>;
    unsetMarker: (id: string | number) => Promise<boolean>;
    clearPolylines: () => Promise<boolean[]>;
    clearPolygons: () => Promise<boolean[]>;
    clearFeatureCollections: (map_objects: MapObjects, feature_layer: google.maps.Data, feature_layers: google.maps.Data[]) => void;
    setMarker: (id: string | number, options: GMW_MarkerOptionsSet) => Promise<GMW_WrappedMarker>;
    clearMarkers: () => Promise<boolean[]>;
    setGeoJSONCollection: (collection: GeoJSONFeatureCollection, options: GMW_FeatureOptionsSet) => Promise<{
        layer: google.maps.Data;
        features: GMW_WrappedFeature[];
    }>;
    setGeoJSONFeature: (feature: GeoJSONFeature, options: GMW_FeatureOptionsSet) => Promise<GMW_WrappedFeature>;
    zoomToObject: (item: GMW_WrappedMarker | GMW_WrappedPolygon | GMW_WrappedPolyline | GMW_WrappedFeature) => void;
    panToObject: (item: GMW_WrappedMarker | GMW_WrappedPolygon | GMW_WrappedPolyline | GMW_WrappedFeature) => void;
    setDrawingMode: (type: "polyline" | "polygon", opts: GMW_PolylineOptions | GMW_PolygonOptions, cb: GMW_DrawingCB) => void;
    cancelDrawingMode: (cancel_drawing: boolean, debug_src?: string) => void;
    setCuttingMode: (polyline_id: string | number, cb?: () => any) => void;
    cuttingPositionUpdate: (mouse_event: google.maps.MouseEvent) => void;
    cuttingClick: (mouse_event: google.maps.MouseEvent) => void;
    completeCuttingMode: () => void;
    cancelCuttingMode: () => void;
    registerDragStartCB: (cb: () => void) => number;
    unregisterDragStartCB: (cb: () => void) => void;
    registerDragEndCB: (cb: () => void) => number;
    unregisterDragEndCB: (cb: () => void) => void;
    getClusterers: () => Promise<MarkerClusterer[]>;
    setClusterer: (clusterer_options: MarkerClustererOptions) => Promise<MarkerClusterer>;
    unsetClusterer: (clusterer: MarkerClusterer) => void;
    createClustererStyle: typeof MarkerClusterer.withDefaultStyle;
    /** Ensure to only use after map initialization. */
    getServices: () => GMW_Services;
};
export interface MapBaseProps {
    initializedCB?: (map: google.maps.Map, funcs: ExportedFunctions) => void;
    googleapi_maps_uri: string;
    id?: string;
    default_center: GMW_LatLngLiteral;
    default_zoom: number;
    default_options?: object;
    onCenterChanged?: () => void;
    onBoundsChanged?: () => void;
    onClick?: (e: any) => void;
    onDoubleClick?: (e: any) => void;
    onDrag?: () => void;
    onDragEnd?: () => void;
    onDragStart?: () => void;
    onHeadingChanged?: () => void;
    onIdle?: () => void;
    onMapTypeIdChanged?: () => void;
    onMouseMove?: (e: any) => void;
    onMouseOut?: (e: any) => void;
    onMouseOver?: (e: any) => void;
    onProjectionChanged?: () => void;
    onResize?: () => void;
    onRightClick?: (e: any) => void;
    onTilesLoaded?: () => void;
    onTiltChanged?: () => void;
    onZoomChanged?: () => void;
    styles?: object;
}
export declare const WrappedMapBase: React.FunctionComponent<MapBaseProps>;
export default WrappedMapBase;
