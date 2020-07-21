type AnyObjectOptions =
  | import("../index").GMW_MarkerOptions
  | import("../index").GMW_PolylineOptions
  | import("../index").GMW_PolygonOptions;
type AnyObjectOptionsSet =
  | import("../index").GMW_MarkerOptionsSet
  | import("../index").GMW_PolylineOptionsSet
  | import("../index").GMW_PolygonOptionsSet;

type AllMapObjEvents =
  | import("../index").GMW_MarkerEvents
  | import("../index").GMW_PolylineEvents
  | import("../index").GMW_PolygonEvents;

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
    [id: string]: import("../index").GMW_WrappedMarker;
    [id: number]: import("../index").GMW_WrappedMarker;
  };
  polygon: {
    [id: string]: import("../index").GMW_WrappedPolygon;
    [id: number]: import("../index").GMW_WrappedPolygon;
  };
  polyline: {
    [id: string]: import("../index").GMW_WrappedPolyline;
    [id: number]: import("../index").GMW_WrappedPolyline;
  };
  features: {
    [id: string]: import("../index").GMW_WrappedFeature;
    [id: number]: import("../index").GMW_WrappedFeature;
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
