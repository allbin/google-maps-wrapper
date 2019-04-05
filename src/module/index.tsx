import * as React from 'react';
import * as ReactDOM from 'react-dom';
import proj4 from 'proj4';
import { Feature, GeoJsonProperties, Geometry, GeoJsonObject } from 'geojson';

import ScriptCache from './ScriptCache';
import { MVCArrayToCoordArray, MVCArrayToObjArray, movePointsByCoord, makePointsAroundCircleRT90, makeRectRT90, convertFromArrayOfArray, arrayToLatLngObject, latLngArrayToCoordArray, haversineDistance, makePointsAroundCircleRT90Type, makeRectRT90Type, movePointsByCoordType, arrayToLatLngObjectType, latLngArrayToCoordArrayType, convertFromArrayOfArrayType, haversineDistanceType, MVCArrayToCoordArrayType, MVCArrayToObjArrayType} from './external_helpers';
import * as internal_helpers from './internal_helpers';
import * as feature_helpers from './feature_helpers';
let ScissorIcon = require('./img/marker_scissors.svg');
let ScissorHoverIcon = require('./img/marker_scissors_hover.svg');


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
export interface LatLng extends google.maps.LatLng {}
export interface MouseEvent extends google.maps.MouseEvent {}
export interface Polyline extends google.maps.Polyline {}
export interface PolylineOptions extends google.maps.PolylineOptions {}
/**
 * Polyline collection must contain a default property.
 * Use Polyline.applyOptions('option_id') to apply one of the defined styles.
 * Use Polyline.setOptions(PolylineOptionsSet) to specify new options.
 */
export interface PolylineOptionsSet {
    default: PolylineOptions;
    [id: string]: PolylineOptions;
}
export interface Polygon extends google.maps.Polygon {}
export interface PolygonOptions extends google.maps.PolygonOptions {}
/**
 * Polygon collection must contain a default property.
 * Use Polygon.applyOptions('option_id') to apply one of the defined styles.
 * Use Polygon.setOptions(PolygonOptionsSet) to specify new options.
 */
export interface PolygonOptionsSet {
    default: PolygonOptions;
    [id: string]: PolygonOptions;
}
export interface Marker extends google.maps.Marker {}
export interface MarkerOptions extends google.maps.MarkerOptions {}
/**
 * Marker collection must contain a default property.
 * Use Marker.applyOptions('option_id') to apply one of the defined styles.
 * Use Marker.setOptions(MarkerOptionsSet) to specify new options.
 */
export interface MarkerOptionsSet {
    default: MarkerOptions;
    [id: string]: MarkerOptions;
}

export type AnyObjectOptions = MarkerOptions | PolylineOptions | PolygonOptions;
export type AnyObjectOptionsSet = MarkerOptionsSet | PolylineOptionsSet | PolygonOptionsSet;


export interface Feature extends google.maps.Data.Feature {}
export interface FeatureOptions extends google.maps.Data.StyleOptions {}
/**
 * Feature collection must contain a default property.
 * Use Feature.applyOptions('option_id') to apply one of the defined styles.
 * Use Feature.setOptions(PolylineOptionsSet) to specify new options.
 */
export interface FeatureOptionsSet {
    default: FeatureOptions;
    [id: string]: FeatureOptions;
}



export type MarkerEvents = "click" | "mouseover" | "mouseout" | "mousedown" | "mouseup" | "dragstart" | "drag" | "dragend" | "dblclick" | "rightclick";
export type PolylineEvents = "click" | "dblclick" | "dragstart" | "drag" | "dragend" | "mouseover" | "mouseout" | "mousedown" | "mouseup" | "mousemove" | "rightclick" | "set_at" | "remove_at" | "insert_at";
export type PolygonEvents = "click" | "dblclick" | "dragstart" | "drag" | "dragend" | "mouseover" | "mouseout" | "mousedown" | "mouseup" | "mousemove" | "rightclick" | "set_at" | "remove_at" | "insert_at";
export type AllMapObjEvents = MarkerEvents | PolylineEvents | PolygonEvents;
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
    /** Do not modify this property.
     * It is used internally to track visibility state of the feature.
     * */
    _visible: boolean;
    selected_options_id: string;
    show: () => void;
    hide: () => void;
    remove: () => void;
    setOptions: (options: FeatureOptionsSet) => Promise<WrappedFeature>;
    applyOptions: (options_id: string) => void;
    registerEventCB: (event_type: MarkerEvents, cb: (e?: any) => void) => void;
    unregisterEventCB: (event_type: MarkerEvents) => void;
}

export type MapObjectType = "polyline" | "polygon" | "marker";


export interface GeoJSONFeature<G extends Geometry | null = Geometry, P extends GeoJsonProperties = null> extends Feature<G, P> {
    id: string | number;
}

export interface GeoJSONFeatureCollection<G extends Geometry | null = Geometry, P = GeoJsonProperties> extends GeoJsonObject {
    type: "FeatureCollection";
    features: Array<GeoJSONFeature<G, P>>;
}


const CUTTING_SNAP_DISTANCE = 200;
const Z_INDEX_SCISSORS = 9001;
const Z_INDEX_SCISSORS_HOVER = 9002;

const PROJECTIONS = {
    gmaps: '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0.0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs +over',
    rt90: '+proj=tmerc +lat_0=0 +lon_0=15.80827777777778 +k=1 +x_0=1500000 +y_0=0 +ellps=bessel +towgs84=414.1,41.3,603.1,-0.855,2.141,-7.023,0 +units=m +no_defs',
    sweref99: '+proj=tmerc +lat_0=0 +lon_0=15.80628452944445 +k=1.00000561024 +x_0=1500064.274 +y_0=-667.711 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
};
proj4.defs('GMAPS', PROJECTIONS.gmaps);
proj4.defs('RT90', PROJECTIONS.rt90);
proj4.defs('SWEREF99', PROJECTIONS.sweref99);



export { makePointsAroundCircleRT90 as pointsAroundCircle };
export { makeRectRT90 };
const arrayRT90ToWGS84 = (rt90arr: [number, number][]) => { return convertFromArrayOfArray("RT90", "WGS84", rt90arr); };
export { arrayRT90ToWGS84 };
const arrayRT90ToWGS84LatLngObj = (rt90arr: [number, number][]) => { return arrayToLatLngObject(convertFromArrayOfArray("RT90", "WGS84", rt90arr), true); };
export {arrayRT90ToWGS84LatLngObj };
export { movePointsByCoord as movePointsByCoord };
export { arrayToLatLngObject as arrToLatLngObj };
export { latLngArrayToCoordArray };
export { convertFromArrayOfArray as convertFromArrayOfCoords };
export { haversineDistance };
export { MVCArrayToCoordArray };
export { MVCArrayToObjArray };


export default class WrappedMapBase extends React.Component<MapBaseProps, any> {

    do_after_init: (() => void)[] = [];
    do_on_drag_end: (() => void)[] = [];
    do_on_drag_start: (() => void)[] = [];
    drawing_completed_listener: google.maps.MapsEventListener | null = null;
    map: google.maps.Map | null = null;
    features_layer: google.maps.Data | null = null;
    feature_layers: google.maps.Data[] = [];
    initialized: boolean = false;
    map_objects: {
        marker: {
            [id: string]: WrappedMarker;
            [id: number]: WrappedMarker;
        }
        polygon: {
            [id: string]: WrappedPolygon;
            [id: number]: WrappedPolygon;
        }
        polyline: {
            [id: string]: WrappedPolyline;
            [id: number]: WrappedPolyline;
        }
        features: {
            [id: string]: WrappedFeature;
            [id: number]: WrappedFeature;
        }
    } = {
        marker: {},
        polygon: {},
        polyline: {},
        features: {}
    };
    cutting_objects: {
        [key: string]: any;
        hover_scissors?: any;
    } = {};
    overlay: google.maps.OverlayView | null = null;
    cutting: {
        enabled: boolean,
        id: string | number | null,
        indexes: number[] | null,
        arr?: [number, number][]
    } = {
        enabled: false,
        id: null,
        indexes: null
    };
    cutting_completed_listener: ((segments: [number, number][][] | null) => void) | null = null;
    cancel_drawing: boolean = false;
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







    constructor(props: MapBaseProps) {
        super(props);

        this.cutting = {
            enabled: false,
            id: null,
            indexes: null,
        };

        this.helpers = {
            rt90: {
                pointsAroundCircle: makePointsAroundCircleRT90,
                makeRect: makeRectRT90,
                arrayRT90ToWGS84: (rt90arr) => { return convertFromArrayOfArray("RT90", "WGS84", rt90arr); },
                arrayRT90ToWGS84LatLngObj: (rt90arr) => { return arrayToLatLngObject(convertFromArrayOfArray("RT90", "WGS84", rt90arr), true); },
                movePointsByCoord: movePointsByCoord
            },
            arrToLatLngObj: arrayToLatLngObject,
            latlngArrayToCoordArray: latLngArrayToCoordArray,
            convertFromArrayOfArray: convertFromArrayOfArray,
            haversineDistance: haversineDistance,
            MVCArrayToCoordArray: MVCArrayToCoordArray,
            MVCArrayToObjArray: MVCArrayToObjArray
        };
    }

    componentWillMount() {
        this.script_cache = ScriptCache({
            google: this.props.googleapi_maps_uri
        });
    }

    componentWillUnmount() {
        if (this.map && this.initialized) {
            window.google.maps.event.clearInstanceListeners(this.map);
        }
    }

    componentDidMount() {
        const refs = this.refs;
        if (this.props.id) {
            if (window.hasOwnProperty("allbin_gmaps")) {
                window.wrapped_gmaps[this.props.id] = this;
            }
        }
        this.script_cache.google.onLoad((err: any) => {

            function CanvasProjectionOverlay() { }
            CanvasProjectionOverlay.prototype = new window.google.maps.OverlayView();
            CanvasProjectionOverlay.prototype.constructor = CanvasProjectionOverlay;
            CanvasProjectionOverlay.prototype.onAdd = function () { };
            CanvasProjectionOverlay.prototype.draw = function () { };
            CanvasProjectionOverlay.prototype.onRemove = function () { };

            const mapRef = refs.map;
            this.html_element = ReactDOM.findDOMNode(mapRef);

            let center = this.props.default_center;
            if (!center) {
                throw new Error("Could not create map: Requires 'default_center' prop.");
            }
            let zoom = (typeof this.props.default_zoom !== "undefined") ? this.props.default_zoom : null;
            if (!zoom) {
                throw new Error("Could not create map: Requires 'default_zoom' prop.");
            }
            if (!this.props.googleapi_maps_uri) {
                throw new Error("Could not create map: Requires 'googleapi_maps_uri' prop. Ex: https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,places,drawing&key=XXXXXXXXXX");
            }
            let defaults = this.props.default_options || {};
            let mapConfig = Object.assign(
                {},
                defaults,
                {
                center: new window.google.maps.LatLng(center.lat, center.lng),
                zoom: zoom,
                gestureHandling: 'greedy',
                styles: this.props.styles || {}
            });
            const maps = window.google.maps;

            this.map = new maps.Map(this.html_element, mapConfig);
            this.features_layer = new maps.Data();
            this.services = {
                geocoderService: new window.google.maps.Geocoder(),
                directionsService: new window.google.maps.DirectionsService(),
            };
            if (window.google.maps.drawing) {
                this.services.drawing = window.google.maps.drawing;
                this.services.drawingManager = new window.google.maps.drawing.DrawingManager({
                    drawingMode: null,
                    drawingControl: false,
                    drawingControlOptions: {
                        drawingModes: []
                    }
                });
                this.services.drawingManager.setMap(this.map);
            }

            this.overlay = new (CanvasProjectionOverlay as any)();
            if (this.overlay) {
                this.overlay.setMap(this.map);
            }
            if (!this.map) {
                throw new Error("Tried to setup events before map instance was defined.");
            }
            this.setupMapEvents(this.map);

            window.google.maps.event.addListenerOnce(this.map, 'idle', () => { this.doAfterInit(); });
        });
    }

    doAfterInit(): void {
        this.initialized = true;
        this.do_after_init.forEach((cb) => {
            cb();
        });

        if (this.props.initializedCB) {
            //Tell parent we are initialized if the parent has asked for it.
            this.props.initializedCB(this);
        }
    }

    setCenter(latLng: LatLngLiteral | LatLng): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.initialized) {
                this.do_after_init.push(() => {
                    this.setCenter(latLng).then((res) => {
                        resolve(res);
                    }).catch((err) => {
                        reject(err);
                    });
                });
                return;
            }
            if (this.map) {
                this.map.setCenter(latLng);
            }
            resolve();
            return;
        });
    }

    fitToBoundsArray(arr_of_coords: [number, number][]) {
        return internal_helpers.fitToBoundsOfArray(this, arr_of_coords);
    }
    fitToBoundsObjectArray(arr_of_objects: LatLngLiteral[]) {
        return internal_helpers.fitToBoundsOfObjectArray(this, arr_of_objects);
    }

    fromLatLngToPixel(map_ref: WrappedMapBase, latLng: LatLng) {
        return internal_helpers.fromLatLngToPixel(this, latLng);
    }

    toPixel(lat_lng_input: LatLng|LatLngLiteral): [number, number] {
        if (!this.overlay) {
            throw new Error("Overlay not loaded when calling toPixel.");
        }
        let node_rect = this.html_element.getBoundingClientRect();
        let lat_lng: LatLng;
        if (lat_lng_input instanceof google.maps.LatLng) {
            lat_lng = lat_lng_input;
        } else {
            lat_lng = new window.google.maps.LatLng(lat_lng_input);
        }
        let pixel_obj = this.overlay.getProjection().fromLatLngToContainerPixel(lat_lng);
        return [pixel_obj.x + node_rect.left, pixel_obj.y + node_rect.top];
    }

    setZoom(zoom_level: number): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.initialized) {
                this.do_after_init.push(() => {
                    this.setZoom(zoom_level).then((res) => {
                        resolve(res);
                    }).catch((err) => {
                        reject(err);
                    });
                });
                return;
            }
            if (this.map) {
                this.map.setZoom(zoom_level);
            }
            resolve();
            return;
        });
    }

    setPolyline(id: string | number, options: PolylineOptionsSet): Promise<WrappedPolyline> {
        return internal_helpers.setPolyline(this, id, options);
    }
    unsetPolyline(id: string | number): Promise<boolean> {
        return internal_helpers.unsetMapObject(this, "polyline", id);
    }
    clearPolylines(): Promise<boolean[]> {
        let promise_arr: Promise<boolean>[] = [];
        Object.keys(this.map_objects.polyline).forEach((id) => {
            promise_arr.push(internal_helpers.unsetMapObject(this, "polyline", id));
        });
        return Promise.all(promise_arr);
    }

    setPolygon(id: string | number, options: PolygonOptionsSet): Promise<WrappedPolygon> {
        return internal_helpers.setPolygon(this, id, options);
    }
    unsetPolygon(id: string | number): Promise<boolean> {
        return internal_helpers.unsetMapObject(this, "polygon", id);
    }
    clearPolygons(): Promise<boolean[]> {
        let promise_arr: Promise<boolean>[] = [];
        Object.keys(this.map_objects.polygon).forEach((id) => {
            promise_arr.push(internal_helpers.unsetMapObject(this, "polygon", id));
        });
        return Promise.all(promise_arr);
    }

    setMarker(id: string | number, options: MarkerOptionsSet): Promise<WrappedMarker> {
        return internal_helpers.setMarker(this, id, options);
    }
    unsetMarker(id: string | number): Promise<boolean> {
        return internal_helpers.unsetMapObject(this, "marker", id);
    }
    clearMarkers(): Promise<boolean[]> {
        let promise_arr: Promise<boolean>[] = [];
        Object.keys(this.map_objects.marker).forEach((id) => {
            promise_arr.push(internal_helpers.unsetMapObject(this, "marker", id));
        });
        return Promise.all(promise_arr);
    }

    setGeoJSONCollection(collection: GeoJSONFeatureCollection, options: FeatureOptionsSet) {
        return feature_helpers.setGeoJSONCollection(this, collection, options);
    }
    setGeoJSONFeature(feature: GeoJSONFeature, options: FeatureOptionsSet) {
        return feature_helpers.setGeoJSONFeature(this, feature, options);
    }
    clearFeatureCollections() {
        this.feature_layers.forEach(x => x.setMap(null));
        this.feature_layers = [];
        if (this.features_layer) {
            Object.keys(this.map_objects.features).forEach((feature_key) => {
                this.map_objects.features[feature_key].remove();
            });
        }
    }

    zoomToObject(obj: WrappedMarker | WrappedPolygon | WrappedPolyline) {
        internal_helpers.panZoomToObject(this, obj, true);
    }
    panToObject(obj: WrappedMarker | WrappedPolygon | WrappedPolyline) {
        internal_helpers.panZoomToObject(this, obj, false);
    }

    registerDragEndCB(cb: () => void): void {
        //Is actually triggered by Idle, not DragEnd!
        this.do_on_drag_end.push(cb);
    }
    unregisterDragEndCB(cb: () => void): void {
        let index = this.do_on_drag_end.indexOf(cb);
        if (index > -1) {
            this.do_on_drag_end.splice(index, 1);
        }
    }
    registerDragStartCB(cb: () => void): void {
        this.do_on_drag_end.push(cb);
    }
    unregisterDragStartCB(cb: () => void): void {
        let index = this.do_on_drag_start.indexOf(cb);
        if (index > -1) {
            this.do_on_drag_start.splice(index, 1);
        }
    }
    setupMapEvents(map: google.maps.Map) {
        map.addListener('center_changed', () => {
            if (this.props.onCenterChanged) {
                this.props.onCenterChanged();
            }
        });
        map.addListener('bounds_changed', () => {
            if (this.props.onBoundsChanged) {
                this.props.onBoundsChanged();
            }
        });
        map.addListener('click', (mouse_event) => {
            if (this.cutting.enabled) {
                this.cuttingClick(mouse_event);
            }
            if (this.props.onClick && !this.cutting.enabled) {
                this.props.onClick(mouse_event);
            }
        });
        map.addListener('dblclick', (mouse_event) => {
            if (this.props.onDoubleClick && !this.cutting.enabled) {
                this.props.onDoubleClick(mouse_event);
            }
        });
        map.addListener('drag', () => {
            if (this.props.onDrag && !this.cutting.enabled) {
                this.props.onDrag();
            }
        });
        map.addListener('dragend', () => {
            if (this.props.onDragEnd && !this.cutting.enabled) {
                this.props.onDragEnd();
            }
        });
        map.addListener('dragstart', () => {
            this.do_on_drag_start.forEach((cb) => {
                if (!this.cutting.enabled) {
                    cb();
                }
            });
            if (this.props.onDragStart && !this.cutting.enabled) {
                this.props.onDragStart();
            }
        });
        map.addListener('heading_changed', () => {
            if (this.props.onHeadingChanged) {
                this.props.onHeadingChanged();
            }
        });
        map.addListener('idle', () => {
            this.do_on_drag_end.forEach((cb) => {
                if (!this.cutting.enabled) {
                    cb();
                }
            });
            if (this.props.onIdle && !this.cutting.enabled) {
                this.props.onIdle();
            }
        });
        map.addListener('maptypeid_changed', () => {
            if (this.props.onMapTypeIdChanged) {
                this.props.onMapTypeIdChanged();
            }
        });
        map.addListener('mousemove', (mouse_event: MouseEvent) => {
            if (this.cutting.enabled) {
                this.cuttingPositionUpdate(mouse_event);
            }
            if (this.props.onMouseMove) {
                this.props.onMouseMove(mouse_event);
            }
        });
        map.addListener('mouseout', (mouse_event: MouseEvent) => {
            if (this.props.onMouseOut) {
                this.props.onMouseOut(mouse_event);
            }
        });
        map.addListener('mouseover', (mouse_event: MouseEvent) => {
            if (this.props.onMouseOver) {
                this.props.onMouseOver(mouse_event);
            }
        });
        map.addListener('projection_changed', () => {
            if (this.props.onProjectionChanged) {
                this.props.onProjectionChanged();
            }
        });
        map.addListener('reize', () => {
            if (this.props.onResize) {
                this.props.onResize();
            }
        });
        map.addListener('rightclick', (mouse_event: MouseEvent) => {
            if (this.props.onRightClick && !this.cutting.enabled) {
                this.props.onRightClick(mouse_event);
            }
        });
        map.addListener('tilesloaded', () => {
            if (this.props.onTilesLoaded) {
                this.props.onTilesLoaded();
            }
        });
        map.addListener('tilt_changed', () => {
            if (this.props.onTiltChanged) {
                this.props.onTiltChanged();
            }
        });
        map.addListener('zoom_changed', () => {
            if (this.props.onZoomChanged) {
                this.props.onZoomChanged();
            }
        });
    }




    setDrawingMode(type: "polyline" | "polygon", opts: PolylineOptions | PolygonOptions, cb: (path: [number, number][] | [number, number] | null, overlay: Polygon|Polyline|Marker) => void) {
        let mode = null;
        if (!this.services.drawing) {
            console.error("MAP: Drawing library not available! Add it to google maps api request url.");
            return;
        }
        if (this.services.drawing.OverlayType.hasOwnProperty(type.toUpperCase())) {
            mode = this.services.drawing.OverlayType[type.toUpperCase()];
        } else {
            throw new Error("MAP: Invalid drawing mode type:" + type);
        }
        let drawing_opts = Object.assign({}, opts, { drawingMode: mode });
        this.services.drawingManager.setOptions(drawing_opts);
        console.log("MAP: Drawing mode started for:", type + ".");
        this.cancel_drawing = false;

        if (this.drawing_completed_listener) {
            this.drawing_completed_listener.remove();
        }
        this.drawing_completed_listener = google.maps.event.addListenerOnce(
            this.services.drawingManager,
            'overlaycomplete',
            (e: google.maps.drawing.OverlayCompleteEvent) => {
                // console.log("overlay complete", cb, this.cancel_drawing);
                e.overlay.setMap(null);
                drawing_opts.drawingMode = null;
                this.services.drawingManager.setOptions(drawing_opts);
                if (!cb || this.cancel_drawing) {
                    return;
                }
                if (type === "polyline" || type === "polygon") {
                    const overlay = e.overlay as Polygon | Polyline;
                    let path = MVCArrayToCoordArray(overlay.getPath());
                    if (cb) { cb(path as [number, number][], overlay); }
                } else if (type === "marker") {
                    const overlay = e.overlay as Marker;
                    let pos = overlay.getPosition();
                    cb([pos.lat(), pos.lng()], overlay);
                } else {
                    cb(null, e.overlay as any);
                }
                this.cancel_drawing = false;
                this.drawing_completed_listener = null;
            }
        );
    }
    completeDrawingMode() {
        if (this.services.drawing) {
            this.services.drawingManager.setOptions({ drawingMode: null });
        }
        if (this.drawing_completed_listener) {
            this.drawing_completed_listener.remove();
            this.drawing_completed_listener = null;
        }
    }
    cancelDrawingMode(debug_src?: string) {
        if (debug_src) {
            console.log("cancel drawing mode:", debug_src);
        }
        if (this.services.drawing && this.drawing_completed_listener) {
            this.cancel_drawing = true;
            this.services.drawingManager.setOptions({ drawingMode: null });
        }
    }





    setCuttingMode(polyline_id: string | number, cb = null) {
        if (this.map_objects.polyline.hasOwnProperty(polyline_id) === false) {
            console.error("MAP: Cannot set cutting mode, provided object id not on map: ", polyline_id);
            return;
        }
        if (!cb) {
            console.error("MAP: Cannot setCuttingMode without supplying completed callback.");
            return;
        }
        this.cancelDrawingMode("setCuttingMode");
        let polyline = this.map_objects.polyline[polyline_id];
        let opts = {
            clickable: false,
            editable: false
        };
        polyline.gmaps_obj.setOptions(opts);

        const path = polyline.options.path;
        this.cutting = {
            enabled: true,
            id: polyline_id,
            indexes: [],
            arr: path as any
        };
        if (!this.cutting_objects.hasOwnProperty("hover_scissors")) {
            let opts = {
                position: this.props.default_center,
                icon: {
                    url: ScissorHoverIcon
                },
                zIndex: Z_INDEX_SCISSORS_HOVER,
                visible: false,
                clickable: false,
                editable: false,
                draggable: false
            };
            let hover_scissors = {
                gmaps_obj: new window.google.maps.Marker(opts),
                options: opts
            };
            hover_scissors.gmaps_obj.setMap(this.map);
            this.cutting_objects.hover_scissors = hover_scissors;
        }
        console.log("MAP: Cutting mode started for id: " + polyline_id);
        this.cutting_completed_listener = (value) => {
            if (cb) {
                (cb as any)(value);
            } else {
                throw new Error("Callback for cutting completed not defined.");
            }
        };
    }
    cuttingPositionUpdate(mouse_event: MouseEvent) {
        if (!this.cutting.enabled || !this.cutting.id) {
            //If we are not in cutting mode ignore this function call.
            return;
        }
        let polyline = this.map_objects.polyline[this.cutting.id];
        let mouse_coord = { lat: mouse_event.latLng.lat(), lng: mouse_event.latLng.lng() };
        let closest_index = 0;
        let closest_dist = 9999999;
        //Find nearest index and move scissors_hover marker.
        polyline.gmaps_obj.getPath().forEach((point, i: number) => {
            let dist = haversineDistance(mouse_coord, { lat: point.lat(), lng: point.lng() });
            if (dist < closest_dist) {
                closest_index = i;
                closest_dist = dist;
            }
        });
        let path = polyline.gmaps_obj.getPath().getArray();
        if (closest_dist < CUTTING_SNAP_DISTANCE && closest_index > 0 && closest_index < path.length - 1) {
            this.cutting_objects.hover_scissors.gmaps_obj.setOptions({
                position: { lat: path[closest_index].lat(), lng: path[closest_index].lng() },
                visible: true
            });
        } else {
            this.cutting_objects.hover_scissors.gmaps_obj.setOptions({
                visible: false
            });
        }
    }
    cuttingClick(mouse_event: google.maps.MouseEvent) {
        if (!this.cutting.id) {
            console.error("No cutting.id set when clicking for cut.");
            return;
        }
        if (!this.cutting.indexes) {
            console.error("cutting.indexes not defined when clicking for cut.");
            return;
        }
        let polyline = this.map_objects.polyline[this.cutting.id];
        let path = polyline.options.path as any;
        let mouse_coord = { lat: mouse_event.latLng.lat(), lng: mouse_event.latLng.lng() };
        let closest_index = 0;
        let closest_dist = 9999999;
        path.forEach((point: any, i: number) => {
            let dist = haversineDistance(mouse_coord, point);
            if (dist < closest_dist) {
                closest_index = i;
                closest_dist = dist;
            }
        });
        if (closest_dist > CUTTING_SNAP_DISTANCE) {
            //Pointer is too far away from any point, ignore.
            return;
        }
        if (closest_index === 0 || closest_index === path.length - 1) {
            //We are never interested in first or last point.
            return;
        }
        let already_selected_position = this.cutting.indexes.findIndex(value => closest_index === value);
        if (already_selected_position > -1) {
            //This index has already been selected for cutting, remove it.
            this.cutting.indexes.splice(already_selected_position, 1);
            if (this.cutting_objects.hasOwnProperty("index_" + closest_index)) {
                //We have drawn a marker for this cut, remove it.
                this.cutting_objects["index_" + closest_index].gmaps_obj.setMap(null);
                delete this.cutting_objects["index_" + closest_index];
            }
        } else {
            this.cutting.indexes.push(closest_index);
            let opts = {
                position: path[closest_index],
                icon: {
                    url: ScissorIcon
                },
                zIndex: Z_INDEX_SCISSORS,
                visible: true,
                clickable: false,
                editable: false,
                draggable: false
            };
            let cut_marker = {
                gmaps_obj: new window.google.maps.Marker(opts),
                options: opts
            };
            cut_marker.gmaps_obj.setMap(this.map);
            this.cutting_objects["index_" + closest_index] = cut_marker;
        }
    }
    completeCuttingMode() {
        if (!this.cutting || this.cutting.id === null) { return; }
        let indexes = this.cutting.indexes;
        let polyline = this.map_objects.polyline[this.cutting.id];
        if (!polyline) { return; }
        this.cutting = {
            enabled: false,
            id: null,
            indexes: null
        };
        Object.keys(this.cutting_objects).forEach((marker_id) => {
            //Remove all cutting related markers.
            this.cutting_objects[marker_id].gmaps_obj.setMap(null);
            delete this.cutting_objects[marker_id];
        });


        let opts = {
            clickable: true,
            editable: true
        };
        polyline.gmaps_obj.setOptions(opts);
        if (!indexes || indexes.length === 0) {
            //We made no selections, just return.
            if (this.cutting_completed_listener) {
                this.cutting_completed_listener(null);
            }
            return;
        }

        let path = polyline.options.path as unknown as [number, number][];
        indexes.sort();
        //Add last index so that the remaining points form a segment as well.
        indexes.push(path.length - 1);
        let resulting_segments: ([number, number][])[] = [];
        let prev_index = 0;
        indexes.forEach((index) => {
            let segment = path.slice(prev_index, index);
            //Copy last point as well.
            segment.push(path[index]);
            resulting_segments.push(segment);
            prev_index = index;
        });
        if (this.cutting_completed_listener) {
            this.cutting_completed_listener(resulting_segments);
        }
    }
    cancelCuttingMode() {
        this.cutting = {
            enabled: false,
            id: null,
            indexes: null
        };
        Object.keys(this.cutting_objects).forEach((marker_id) => {
            //Remove all cutting related markers.
            this.cutting_objects[marker_id].gmaps_obj.setMap(null);
            delete this.cutting_objects[marker_id];
        });
        if (!this.cutting.id) {
            console.error("No cutting.id set when cancelling cutting mode.");
            return;
        }
        let polyline = this.map_objects.polyline[this.cutting.id];
        if (polyline) {
            let opts = {
                clickable: true,
                editable: true
            };
            polyline.gmaps_obj.setOptions(opts);
        }
    }


    render() {
        return (
            <div style={{ height: "100%" }}>
                <div ref="map" style={{ position:"absolute", top: '0', left: '0', right: '0', bottom: '0' }} />
            </div>
        );
    }
}



