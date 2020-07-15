/// <reference types="googlemaps" />
export declare const fromLatLngToPixel: (map: google.maps.Map, latLng: google.maps.LatLng) => any;
export declare const fitToBoundsOfArray: (map: google.maps.Map, arr_of_coords: [number, number][]) => Promise<void>;
export declare const fitToBoundsLiteral: (bounds: LatLngBoundsLiteral, map?: google.maps.Map | undefined) => Promise<void>;
export declare const fitToBoundsOfObjectArray: (arr_of_latlngliteral: LatLngLiteral[], map?: google.maps.Map | undefined) => Promise<void>;
export declare const setPolyline: (map: google.maps.Map, map_objects: MapObjects, cutting: CuttingState, id: string | number, options: PolylineOptionsSet) => Promise<WrappedPolyline>;
export declare const setPolygon: (map: google.maps.Map, map_objects: MapObjects, cutting: CuttingState, id: string | number, options: PolygonOptionsSet) => Promise<WrappedPolygon>;
export declare const setMarker: (map: google.maps.Map, map_objects: MapObjects, cutting: CuttingState, id: string | number, options: MarkerOptionsSet) => Promise<WrappedMarker>;
declare type setMapObject = (map: google.maps.Map, map_objects: MapObjects, cutting: CuttingState, type: MapObjectType, id: string | number, options: AnyObjectOptionsSet, current_options_id?: string) => Promise<WrappedPolyline | WrappedPolygon | WrappedMarker>;
export declare const setMapObject: setMapObject;
export declare const unsetMapObject: (map_objects: MapObjects, cutting: CuttingState, type: MapObjectType, id: string | number) => Promise<boolean>;
export declare const mapObjectEventCB: (cutting: CuttingState, map_obj: WrappedGmapObj, event_type: PolylineEvents, e: any) => boolean;
export declare const panZoomToObjectOrFeature: (map: google.maps.Map, obj: WrappedPolyline | WrappedPolygon | WrappedMarker | WrappedFeature, zoom?: boolean) => void;
export {};
