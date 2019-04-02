/// <reference types="googlemaps" />
import * as React from 'react';
import { MVCArrayToCoordArray, MVCArrayToObjArray, movePointsByCoord, makePointsAroundCircleRT90, makeRectRT90, convertFromArrayOfArray, arrayToLatLngObject, latLngArrayToCoordArray, haversineDistance } from './external_helpers';
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
export interface Polygon extends google.maps.Polygon {
}
export interface PolygonOptions extends google.maps.PolygonOptions {
}
export interface Marker extends google.maps.Marker {
}
export interface MarkerOptions extends google.maps.MarkerOptions {
}
export declare type MarkerEvents = "click" | "mouseover" | "mouseout" | "mousedown" | "mouseup" | "dragstart" | "drag" | "dragend" | "dblclick" | "rightclick";
export declare type PolylineEvents = "click" | "dblclick" | "dragstart" | "drag" | "dragend" | "mouseover" | "mouseout" | "mousedown" | "mouseup" | "mousemove" | "rightclick" | "set_at" | "remove_at" | "insert_at";
export declare type PolygonEvents = "click" | "dblclick" | "dragstart" | "drag" | "dragend" | "mouseover" | "mouseout" | "mousedown" | "mouseup" | "mousemove" | "rightclick" | "set_at" | "remove_at" | "insert_at";
export declare type AllMapObjEvents = MarkerEvents | PolylineEvents | PolygonEvents;
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
    hover: () => void;
    hovered: boolean;
    hover_options: any;
    unhover: () => void;
    show: () => void;
    hide: () => void;
    remove: () => void;
    _cbs: {
        [key: string]: (e?: any) => void;
    };
    registerEventCB: (event_type: MarkerEvents & PolygonEvents & PolylineEvents, cb: (e?: any) => void) => void;
    unregisterEventCB: (event_type: MarkerEvents & PolygonEvents & PolylineEvents) => void;
    options: any;
    update: (options: any) => Promise<WrappedGmapObj>;
    updateHover: (options: any) => Promise<WrappedGmapObj>;
    zoomTo: () => void;
    panTo: () => void;
}
export interface WrappedPolygon extends WrappedGmapObj {
    gmaps_obj: Polygon;
    type: "polygon";
    options: PolygonOptions;
    hover_options: PolygonOptions;
    update: (options: PolygonOptions) => Promise<WrappedPolygon>;
    updateHover: (options: PolygonOptions) => Promise<WrappedPolygon>;
    registerEventCB: (event_type: PolygonEvents, cb: (e?: any) => void) => void;
    unregisterEventCB: (event_type: PolygonEvents) => void;
}
export interface WrappedPolyline extends WrappedGmapObj {
    gmaps_obj: Polyline;
    type: "polyline";
    options: PolylineOptions;
    hover_options: PolylineOptions;
    update: (options: PolylineOptions) => Promise<WrappedPolyline>;
    updateHover: (options: PolylineOptions) => Promise<WrappedPolyline>;
    registerEventCB: (event_type: PolylineEvents, cb: (e?: any) => void) => void;
    unregisterEventCB: (event_type: PolylineEvents) => void;
}
export interface WrappedMarker extends WrappedGmapObj {
    gmaps_obj: Marker;
    type: "marker";
    options: MarkerOptions;
    hover_options: MarkerOptions;
    update: (options: MarkerOptions) => Promise<WrappedMarker>;
    updateHover: (options: MarkerOptions) => Promise<WrappedMarker>;
    registerEventCB: (event_type: MarkerEvents, cb: (e?: any) => void) => void;
    unregisterEventCB: (event_type: MarkerEvents) => void;
}
export declare type AnyObjectOptions = MarkerOptions | PolylineOptions | PolygonOptions;
export declare type MapObjectType = "polyline" | "polygon" | "marker";
export default class WrappedMapBase extends React.Component<MapBaseProps, any> {
    do_after_init: (() => void)[];
    do_on_drag_end: (() => void)[];
    do_on_drag_start: (() => void)[];
    drawing_completed_listener: google.maps.MapsEventListener | null;
    map: google.maps.Map | null;
    initialized: boolean;
    map_objects: {
        marker: {
            [key: string]: WrappedMarker;
            [index: number]: WrappedMarker;
        };
        polygon: {
            [key: string]: WrappedPolygon;
            [index: number]: WrappedPolygon;
        };
        polyline: {
            [key: string]: WrappedPolyline;
            [index: number]: WrappedPolyline;
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
            pointsAroundCircle: makePointsAroundCircleRT90;
            makeRect: makeRectRT90;
            arrayRT90ToWGS84: (rt90_array: [number, number][]) => [number, number][];
            arrayRT90ToWGS84LatLngObj: (rt90_array: [number, number][]) => LatLngLiteral[];
            movePointsByCoord: movePointsByCoord;
        };
        arrToLatLngObj: arrayToLatLngObject;
        latlngArrayToCoordArray: latLngArrayToCoordArray;
        convertFromArrayOfArray: convertFromArrayOfArray;
        haversineDistance: haversineDistance;
        MVCArrayToCoordArray: MVCArrayToCoordArray;
        MVCArrayToObjArray: MVCArrayToObjArray;
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
    setPolyline(id: string | number, options: PolylineOptions, hover_options?: PolylineOptions | null): Promise<WrappedPolyline>;
    unsetPolyline(id: string | number): Promise<boolean>;
    clearPolylines(): Promise<boolean[]>;
    setPolygon(id: string | number, options: PolygonOptions, hover_options?: PolygonOptions | null): Promise<WrappedPolygon>;
    unsetPolygon(id: string | number): Promise<boolean>;
    clearPolygons(): Promise<boolean[]>;
    setMarker(id: string | number, options: MarkerOptions, hover_options?: MarkerOptions | null): Promise<WrappedMarker>;
    unsetMarker(id: string | number): Promise<boolean>;
    clearMarkers(): Promise<boolean[]>;
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
