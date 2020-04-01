interface LatLngLiteral {
  lat: number;
  lng: number;
}

interface LatLngBoundsLiteral {
  north: number;
  east: number;
  south: number;
  west: number;
}

interface LatLng extends google.maps.LatLng {}

interface MouseEvent extends google.maps.MouseEvent {}

interface Polyline extends google.maps.Polyline {}

interface PolylineOptions extends google.maps.PolylineOptions {}

/**
 * Polyline collection must contain a default property.
 * Use Polyline.applyOptions('option_id') to apply one of the defined styles.
 * Use Polyline.setOptions(PolylineOptionsSet) to specify new options.
 */
interface PolylineOptionsSet {
  default: PolylineOptions;

  [id: string]: PolylineOptions;
}

interface Polygon extends google.maps.Polygon {}

interface PolygonOptions extends google.maps.PolygonOptions {}

/**
 * Polygon collection must contain a default property.
 * Use Polygon.applyOptions('option_id') to apply one of the defined styles.
 * Use Polygon.setOptions(PolygonOptionsSet) to specify new options.
 */
interface PolygonOptionsSet {
  default: PolygonOptions;

  [id: string]: PolygonOptions;
}

interface Marker extends google.maps.Marker {}

interface MarkerOptions extends google.maps.MarkerOptions {}

/**
 * Marker collection must contain a default property.
 * Use Marker.applyOptions('option_id') to apply one of the defined styles.
 * Use Marker.setOptions(MarkerOptionsSet) to specify new options.
 */
interface MarkerOptionsSet {
  default: MarkerOptions;

  [id: string]: MarkerOptions;
}

type AnyObjectOptions = MarkerOptions | PolylineOptions | PolygonOptions;
type AnyObjectOptionsSet =
  | MarkerOptionsSet
  | PolylineOptionsSet
  | PolygonOptionsSet;

interface Feature extends google.maps.Data.Feature {}

interface FeatureOptions extends google.maps.Data.StyleOptions {}

/**
 * Feature collection must contain a default property.
 * Use Feature.applyOptions('option_id') to apply one of the defined styles.
 * Use Feature.setOptions(PolylineOptionsSet) to specify new options.
 */
interface FeatureOptionsSet {
  default: FeatureOptions;

  [id: string]: FeatureOptions;
}

type MarkerEvents =
  | "click"
  | "mouseover"
  | "mouseout"
  | "mousedown"
  | "mouseup"
  | "dragstart"
  | "drag"
  | "dragend"
  | "dblclick"
  | "rightclick";
type PolylineEvents =
  | "click"
  | "dblclick"
  | "dragstart"
  | "drag"
  | "dragend"
  | "mouseover"
  | "mouseout"
  | "mousedown"
  | "mouseup"
  | "mousemove"
  | "rightclick"
  | "set_at"
  | "remove_at"
  | "insert_at";
type PolygonEvents =
  | "click"
  | "dblclick"
  | "dragstart"
  | "drag"
  | "dragend"
  | "mouseover"
  | "mouseout"
  | "mousedown"
  | "mouseup"
  | "mousemove"
  | "rightclick"
  | "set_at"
  | "remove_at"
  | "insert_at";
type AllMapObjEvents = MarkerEvents | PolylineEvents | PolygonEvents;
type FeatureEvents =
  | "click"
  | "mouseover"
  | "mouseout"
  | "mousedown"
  | "mouseup"
  | "rightclick";

interface WrappedGmapObj {
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
  registerEventCB: (
    event_type: MarkerEvents & PolygonEvents & PolylineEvents,
    cb: (e?: any) => void
  ) => void;
  unregisterEventCB: (
    event_type: MarkerEvents & PolygonEvents & PolylineEvents
  ) => void;
  options: any;
  selected_options_id: string;
  setOptions: (options: any) => Promise<WrappedGmapObj>;
  applyOptions: (options_id: string) => void;
  zoomTo: () => void;
  panTo: () => void;
}

interface WrappedPolygon extends WrappedGmapObj {
  gmaps_obj: Polygon;
  type: "polygon";
  options: PolygonOptionsSet;
  setOptions: (options: PolygonOptionsSet) => Promise<WrappedPolygon>;
  applyOptions: (options_id: string) => void;
  registerEventCB: (event_type: PolygonEvents, cb: (e?: any) => void) => void;
  unregisterEventCB: (event_type: PolygonEvents) => void;
}

interface WrappedPolyline extends WrappedGmapObj {
  gmaps_obj: Polyline;
  type: "polyline";
  options: PolylineOptionsSet;
  setOptions: (options: PolylineOptionsSet) => Promise<WrappedPolyline>;
  registerEventCB: (event_type: PolylineEvents, cb: (e?: any) => void) => void;
  unregisterEventCB: (event_type: PolylineEvents) => void;
}

interface WrappedMarker extends WrappedGmapObj {
  gmaps_obj: Marker;
  type: "marker";
  options: MarkerOptionsSet;
  setOptions: (options: MarkerOptionsSet) => Promise<WrappedMarker>;
  registerEventCB: (event_type: MarkerEvents, cb: (e?: any) => void) => void;
  unregisterEventCB: (event_type: MarkerEvents) => void;
}

interface WrappedFeature {
  gmaps_feature: google.maps.Data.Feature;
  options: FeatureOptionsSet;
  /** **Do not modify this property**
   *
   * It is used internally to track visibility state of the feature.
   * */
  _visible: boolean;
  /** **Do not modify this property**
   *
   * It is used internally to track event callbacks.
   * */
  _cbs: { [key: string]: (e: google.maps.Data.MouseEvent) => void };
  /** **Do not modify this property**.
   *
   * It is used internally for panTo and zoomTo operations.
   * */
  _bbox: google.maps.LatLngBounds;
  selected_options_id: string;
  show: () => void;
  hide: () => void;
  remove: () => void;
  setOptions: (options: FeatureOptionsSet) => Promise<WrappedFeature>;
  applyOptions: (options_id: string) => void;
  registerEventCB: (
    event_type: FeatureEvents,
    cb: (e: google.maps.Data.MouseEvent) => void
  ) => void;
  unregisterEventCB: (event_type: FeatureEvents) => void;
  zoomTo: () => void;
  panTo: () => void;
}

type MapObjectType = "polyline" | "polygon" | "marker";
interface GeoJSONFeature<
  G extends GeoJSON.Geometry | null = GeoJSON.Geometry,
  P extends GeoJSON.GeoJsonProperties = null
> extends GeoJSON.Feature<G, P> {
  id: string | number;
}

interface GeoJSONFeatureCollection<
  G extends GeoJSON.Geometry | null = GeoJSON.Geometry,
  P = GeoJSON.GeoJsonProperties
> extends GeoJSON.GeoJsonObject {
  type: "FeatureCollection";
  features: Array<GeoJSONFeature<G, P>>;
}

interface MapObjects {
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
}

interface CuttingState {
  enabled: boolean;
  id: string | number | null;
  indexes: number[] | null;
  arr?: [number, number][];
}
interface CuttingObjects {
  [key: string]: any;
  hover_scissors?: any;
}
type DrawingCB = (
    path: [number, number][] | [number, number] | null,
    overlay: Polygon | Polyline | Marker
) => void

type Services= {
  geocoderService: any,
  directionsService: any,
  drawing?: any,
  drawingManager?: any
}
