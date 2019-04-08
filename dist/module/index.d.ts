/// <reference types="googlemaps" />
import * as React from 'react';
import { Feature, GeoJsonProperties, Geometry, GeoJsonObject } from 'geojson';
import { MVCArrayToCoordArray, MVCArrayToObjArray, movePointsByCoord, makePointsAroundCircleRT90, makeRectRT90, convertFromArrayOfArray, arrayToLatLngObject, latLngArrayToCoordArray, haversineDistance, makePointsAroundCircleRT90Type, makeRectRT90Type, movePointsByCoordType, arrayToLatLngObjectType, latLngArrayToCoordArrayType, convertFromArrayOfArrayType, haversineDistanceType, MVCArrayToCoordArrayType, MVCArrayToObjArrayType } from './external_helpers';
declare global {
    interface Window {
        google: any;
        wrapped_gmaps: any;
    }
}
export interface LatLngLiteral {
    lat: number;
    lng: number;
}
export interface LatLng extends google.maps.LatLng {
}
export interface MouseEvent extends google.maps.MouseEvent {
}
export interface Polyline extends google.maps.Polyline {
}
export interface PolylineOptions extends google.maps.PolylineOptions {
}
/**
 * Polyline collection must contain a default property.
 * Use Polyline.applyOptions('option_id') to apply one of the defined styles.
 * Use Polyline.setOptions(PolylineOptionsSet) to specify new options.
 */
export interface PolylineOptionsSet {
    default: PolylineOptions;
    [id: string]: PolylineOptions;
}
export interface Polygon extends google.maps.Polygon {
}
export interface PolygonOptions extends google.maps.PolygonOptions {
}
/**
 * Polygon collection must contain a default property.
 * Use Polygon.applyOptions('option_id') to apply one of the defined styles.
 * Use Polygon.setOptions(PolygonOptionsSet) to specify new options.
 */
export interface PolygonOptionsSet {
    default: PolygonOptions;
    [id: string]: PolygonOptions;
}
export interface Marker extends google.maps.Marker {
}
export interface MarkerOptions extends google.maps.MarkerOptions {
}
/**
 * Marker collection must contain a default property.
 * Use Marker.applyOptions('option_id') to apply one of the defined styles.
 * Use Marker.setOptions(MarkerOptionsSet) to specify new options.
 */
export interface MarkerOptionsSet {
    default: MarkerOptions;
    [id: string]: MarkerOptions;
}
export declare type AnyObjectOptions = MarkerOptions | PolylineOptions | PolygonOptions;
export declare type AnyObjectOptionsSet = MarkerOptionsSet | PolylineOptionsSet | PolygonOptionsSet;
export interface Feature extends google.maps.Data.Feature {
}
export interface FeatureOptions extends google.maps.Data.StyleOptions {
}
/**
 * Feature collection must contain a default property.
 * Use Feature.applyOptions('option_id') to apply one of the defined styles.
 * Use Feature.setOptions(PolylineOptionsSet) to specify new options.
 */
export interface FeatureOptionsSet {
    default: FeatureOptions;
    [id: string]: FeatureOptions;
}
export declare type MarkerEvents = "click" | "mouseover" | "mouseout" | "mousedown" | "mouseup" | "dragstart" | "drag" | "dragend" | "dblclick" | "rightclick";
export declare type PolylineEvents = "click" | "dblclick" | "dragstart" | "drag" | "dragend" | "mouseover" | "mouseout" | "mousedown" | "mouseup" | "mousemove" | "rightclick" | "set_at" | "remove_at" | "insert_at";
export declare type PolygonEvents = "click" | "dblclick" | "dragstart" | "drag" | "dragend" | "mouseover" | "mouseout" | "mousedown" | "mouseup" | "mousemove" | "rightclick" | "set_at" | "remove_at" | "insert_at";
export declare type AllMapObjEvents = MarkerEvents | PolylineEvents | PolygonEvents;
export declare type FeatureEvents = "click" | "mouseover" | "mouseout" | "mousedown" | "mouseup" | "rightclick";
export interface MapBaseProps {
    initializedCB?: (this_ref: WrappedMapBase) => void;
    googleapi_maps_uri: string;
    id?: string;
    default_center: LatLngLiteral;
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
export interface WrappedGmapObj {
    gmaps_obj?: any;
    type: MapObjectType;
    show: () => void;
    hide: () => void;
    remove: () => void;
    /** **Do not modify this property**.
     *
     * It is used internally to track event callbacks.
     * */
    _cbs: {
        [key: string]: (e?: any) => void;
    };
    registerEventCB: (event_type: MarkerEvents & PolygonEvents & PolylineEvents, cb: (e?: any) => void) => void;
    unregisterEventCB: (event_type: MarkerEvents & PolygonEvents & PolylineEvents) => void;
    options: any;
    selected_options_id: string;
    setOptions: (options: any) => Promise<WrappedGmapObj>;
    applyOptions: (options_id: string) => void;
    zoomTo: () => void;
    panTo: () => void;
}
export interface WrappedPolygon extends WrappedGmapObj {
    gmaps_obj: Polygon;
    type: "polygon";
    options: PolygonOptionsSet;
    setOptions: (options: PolygonOptionsSet) => Promise<WrappedPolygon>;
    applyOptions: (options_id: string) => void;
    registerEventCB: (event_type: PolygonEvents, cb: (e?: any) => void) => void;
    unregisterEventCB: (event_type: PolygonEvents) => void;
}
export interface WrappedPolyline extends WrappedGmapObj {
    gmaps_obj: Polyline;
    type: "polyline";
    options: PolylineOptionsSet;
    setOptions: (options: PolylineOptionsSet) => Promise<WrappedPolyline>;
    registerEventCB: (event_type: PolylineEvents, cb: (e?: any) => void) => void;
    unregisterEventCB: (event_type: PolylineEvents) => void;
}
export interface WrappedMarker extends WrappedGmapObj {
    gmaps_obj: Marker;
    type: "marker";
    options: MarkerOptionsSet;
    setOptions: (options: MarkerOptionsSet) => Promise<WrappedMarker>;
    registerEventCB: (event_type: MarkerEvents, cb: (e?: any) => void) => void;
    unregisterEventCB: (event_type: MarkerEvents) => void;
}
export interface WrappedFeature {
    gmaps_feature: google.maps.Data.Feature;
    options: FeatureOptionsSet;
    /** **Do not modify this property**
     *
     * It is used internally to track visibility state of the feature.
     * */
    _visible: boolean;
    /** **Do not modify this property**.
     *
     * It is used internally to track event callbacks.
     * */
    _cbs: {
        [key: string]: (e: google.maps.Data.MouseEvent) => void;
    };
    selected_options_id: string;
    show: () => void;
    hide: () => void;
    remove: () => void;
    setOptions: (options: FeatureOptionsSet) => Promise<WrappedFeature>;
    applyOptions: (options_id: string) => void;
    registerEventCB: (event_type: FeatureEvents, cb: (e: google.maps.Data.MouseEvent) => void) => void;
    unregisterEventCB: (event_type: FeatureEvents) => void;
}
export declare type MapObjectType = "polyline" | "polygon" | "marker";
export interface GeoJSONFeature<G extends Geometry | null = Geometry, P extends GeoJsonProperties = null> extends Feature<G, P> {
    id: string | number;
}
export interface GeoJSONFeatureCollection<G extends Geometry | null = Geometry, P = GeoJsonProperties> extends GeoJsonObject {
    type: "FeatureCollection";
    features: Array<GeoJSONFeature<G, P>>;
}
export { makePointsAroundCircleRT90 as pointsAroundCircle };
export { makeRectRT90 };
declare const arrayRT90ToWGS84: (rt90arr: [number, number][]) => [number, number][];
export { arrayRT90ToWGS84 };
declare const arrayRT90ToWGS84LatLngObj: (rt90arr: [number, number][]) => LatLngLiteral[];
export { arrayRT90ToWGS84LatLngObj };
export { movePointsByCoord as movePointsByCoord };
export { arrayToLatLngObject as arrToLatLngObj };
export { latLngArrayToCoordArray };
export { convertFromArrayOfArray as convertFromArrayOfCoords };
export { haversineDistance };
export { MVCArrayToCoordArray };
export { MVCArrayToObjArray };
export default class WrappedMapBase extends React.Component<MapBaseProps, any> {
    do_after_init: (() => void)[];
    do_on_drag_end: (() => void)[];
    do_on_drag_start: (() => void)[];
    drawing_completed_listener: google.maps.MapsEventListener | null;
    map: google.maps.Map | null;
    features_layer: google.maps.Data | null;
    feature_layers: google.maps.Data[];
    initialized: boolean;
    map_objects: {
        marker: {
            [id: string]: WrappedMarker;
            [id: number]: WrappedMarker;
        };
        polygon: {
            [id: string]: WrappedPolygon;
            [id: number]: WrappedPolygon;
        };
        polyline: {
            [id: string]: WrappedPolyline;
            [id: number]: WrappedPolyline;
        };
        features: {
            [id: string]: WrappedFeature;
            [id: number]: WrappedFeature;
        };
    };
    cutting_objects: {
        [key: string]: any;
        hover_scissors?: any;
    };
    overlay: google.maps.OverlayView | null;
    cutting: {
        enabled: boolean;
        id: string | number | null;
        indexes: number[] | null;
        arr?: [number, number][];
    };
    cutting_completed_listener: ((segments: [number, number][][] | null) => void) | null;
    cancel_drawing: boolean;
    helpers: {
        rt90: {
            pointsAroundCircle: makePointsAroundCircleRT90Type;
            makeRect: makeRectRT90Type;
            arrayRT90ToWGS84: (rt90_array: [number, number][]) => [number, number][];
            arrayRT90ToWGS84LatLngObj: (rt90_array: [number, number][]) => LatLngLiteral[];
            movePointsByCoord: movePointsByCoordType;
        };
        arrToLatLngObj: arrayToLatLngObjectType;
        latlngArrayToCoordArray: latLngArrayToCoordArrayType;
        convertFromArrayOfArray: convertFromArrayOfArrayType;
        haversineDistance: haversineDistanceType;
        MVCArrayToCoordArray: MVCArrayToCoordArrayType;
        MVCArrayToObjArray: MVCArrayToObjArrayType;
    };
    script_cache: any;
    html_element: any;
    services: any;
    constructor(props: MapBaseProps);
    componentWillMount(): void;
    componentWillUnmount(): void;
    componentDidMount(): void;
    doAfterInit(): void;
    setCenter(latLng: LatLngLiteral | LatLng): Promise<void>;
    fitToBoundsArray(arr_of_coords: [number, number][]): Promise<{}>;
    fitToBoundsObjectArray(arr_of_objects: LatLngLiteral[]): Promise<{}>;
    fromLatLngToPixel(map_ref: WrappedMapBase, latLng: LatLng): any;
    toPixel(lat_lng_input: LatLng | LatLngLiteral): [number, number];
    setZoom(zoom_level: number): Promise<void>;
    setPolyline(id: string | number, options: PolylineOptionsSet): Promise<WrappedPolyline>;
    unsetPolyline(id: string | number): Promise<boolean>;
    clearPolylines(): Promise<boolean[]>;
    setPolygon(id: string | number, options: PolygonOptionsSet): Promise<WrappedPolygon>;
    unsetPolygon(id: string | number): Promise<boolean>;
    clearPolygons(): Promise<boolean[]>;
    setMarker(id: string | number, options: MarkerOptionsSet): Promise<WrappedMarker>;
    unsetMarker(id: string | number): Promise<boolean>;
    clearMarkers(): Promise<boolean[]>;
    setGeoJSONCollection(collection: GeoJSONFeatureCollection, options: FeatureOptionsSet): Promise<{
        layer: google.maps.Data;
        features: WrappedFeature[];
    }>;
    setGeoJSONFeature(feature: GeoJSONFeature, options: FeatureOptionsSet): Promise<WrappedFeature>;
    clearFeatureCollections(): void;
    zoomToObject(obj: WrappedMarker | WrappedPolygon | WrappedPolyline): void;
    panToObject(obj: WrappedMarker | WrappedPolygon | WrappedPolyline): void;
    registerDragEndCB(cb: () => void): void;
    unregisterDragEndCB(cb: () => void): void;
    registerDragStartCB(cb: () => void): void;
    unregisterDragStartCB(cb: () => void): void;
    setupMapEvents(map: google.maps.Map): void;
    setDrawingMode(type: "polyline" | "polygon", opts: PolylineOptions | PolygonOptions, cb: (path: [number, number][] | [number, number] | null, overlay: Polygon | Polyline | Marker) => void): void;
    completeDrawingMode(): void;
    cancelDrawingMode(debug_src?: string): void;
    setCuttingMode(polyline_id: string | number, cb?: null): void;
    cuttingPositionUpdate(mouse_event: MouseEvent): void;
    cuttingClick(mouse_event: google.maps.MouseEvent): void;
    completeCuttingMode(): void;
    cancelCuttingMode(): void;
    render(): JSX.Element;
}
