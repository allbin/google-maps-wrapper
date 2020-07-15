/// <reference types="googlemaps" />
export declare const getBoundsLiteral: (map: google.maps.Map | undefined) => {
    north: number;
    east: number;
    south: number;
    west: number;
} | undefined;
/*** Takes a coordinate and center it on the map  */
export declare const setCenter: (map: google.maps.Map | undefined, lat_lng: google.maps.LatLng | LatLngLiteral) => Promise<void>;
export declare const toPixel: (lat_lng_input: google.maps.LatLng | LatLngLiteral, html_element: any, overlay: google.maps.OverlayView | undefined) => [number, number];
export declare const setZoom: (zoom_level: number, map: google.maps.Map | undefined) => Promise<void>;
export declare const clearPolylines: (map_objects: MapObjects, cutting: CuttingState) => Promise<boolean[]>;
export declare const clearPolygons: (map_objects: MapObjects, cutting: CuttingState) => Promise<boolean[]>;
export declare const setMarker: (map: google.maps.Map, map_objects: MapObjects, cutting: CuttingState, id: string | number, options: MarkerOptionsSet) => Promise<WrappedMarker>;
export declare const clearMarkers: (map_objects: MapObjects, cutting: CuttingState) => Promise<boolean[]>;
export declare const clearFeatureCollections: (map_objects: MapObjects, features_layer: google.maps.Data, feature_layers: google.maps.Data[]) => void;
export declare const setDrawingMode: (services: Services, type: "polyline" | "polygon", opts: google.maps.PolygonOptions | google.maps.PolylineOptions, cb: DrawingCB, cancel_drawing: boolean, setDrawingCompletedListener: (listener: google.maps.MapsEventListener) => void, drawing_completed_listener?: google.maps.MapsEventListener | undefined) => void;
export declare const completeDrawingMode: (services: Services, drawing_completed_listener: google.maps.MapsEventListener) => void;
export declare const cancelDrawingMode: (services: Services, cancel_drawing: boolean, drawing_completed_listener: google.maps.MapsEventListener, debug_src?: string | undefined) => void;
export declare const setCuttingMode: (services: Services, map: google.maps.Map, map_objects: MapObjects, cutting: CuttingState, cutting_objects: CuttingObjects, default_center: LatLngLiteral, cancel_drawing: boolean, drawing_completed_listener: google.maps.MapsEventListener, polyline_id: string | number, cutting_completed_listener: (segments: [number, number][][] | null) => void, cb?: (() => any) | undefined) => void;
export declare const cuttingPositionUpdate: (mouse_event: google.maps.MouseEvent, map_objects: MapObjects, cutting: CuttingState, cutting_objects: CuttingObjects) => void;
export declare const cuttingClick: (mouse_event: google.maps.MouseEvent, map: google.maps.Map, map_objects: MapObjects, cutting: CuttingState, cutting_objects: CuttingObjects) => void;
export declare const completeCuttingMode: (map_objects: MapObjects, cutting: CuttingState, cutting_objects: CuttingObjects, cutting_completed_listener: (segments: [number, number][][] | null) => void) => void;
export declare const cancelCuttingMode: (map_objects: MapObjects, cutting: CuttingState, cutting_objects: CuttingObjects) => void;
