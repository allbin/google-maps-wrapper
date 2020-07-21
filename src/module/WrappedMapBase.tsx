import React, { useEffect, useRef, useState } from "react";
import MarkerClusterer, {
  MarkerClustererOptions,
  ClusterIconStyle,
} from "@google/markerclustererplus";
import ScriptCache from "./ScriptCache";
import * as feature_helpers from "./feature_helpers";
import * as map_funcs from "./map_functions";
import {
  panZoomToObjectOrFeature,
  setMarker,
  setPolygon,
  setPolyline,
  unsetMapObject,
} from "./internal_helpers";
import {
  GMW_LatLngBoundsLiteral,
  GMW_LatLngLiteral,
  GMW_LatLng,
  GMW_PolylineOptionsSet,
  GMW_PolygonOptionsSet,
  GMW_MarkerOptionsSet,
  GMW_PolylineOptions,
  GMW_PolygonOptions,
  GMW_WrappedPolyline,
  GMW_WrappedPolygon,
  GMW_WrappedMarker,
  GMW_FeatureOptionsSet,
  GMW_WrappedFeature,
  GMW_DrawingCB,
  GMW_Services,
} from ".";

export type ExportedFunctions = {
  getBoundsLiteral: () => GMW_LatLngBoundsLiteral | undefined;
  setCenter: (lat_lng: GMW_LatLngLiteral | GMW_LatLng) => Promise<void>;
  toPixel: (lat_lng_pixel: GMW_LatLng | GMW_LatLngLiteral) => [number, number];
  setZoom: (zoom_level: number) => Promise<void>;
  setPolyline: (
    id: string | number,
    options: GMW_PolylineOptionsSet
  ) => Promise<GMW_WrappedPolyline>;
  setPolygon: (
    id: string | number,
    options: GMW_PolygonOptionsSet
  ) => Promise<GMW_WrappedPolygon>;
  unsetPolyline: (id: string | number) => Promise<boolean>;
  unsetPolygon: (id: string | number) => Promise<boolean>;
  unsetMarker: (id: string | number) => Promise<boolean>;
  clearPolylines: () => Promise<boolean[]>;
  clearPolygons: () => Promise<boolean[]>;
  clearFeatureCollections: (
    map_objects: MapObjects,
    feature_layer: google.maps.Data,
    feature_layers: google.maps.Data[]
  ) => void;
  setMarker: (
    id: string | number,
    options: GMW_MarkerOptionsSet
  ) => Promise<GMW_WrappedMarker>;
  clearMarkers: () => Promise<boolean[]>;
  setGeoJSONCollection: (
    collection: GeoJSONFeatureCollection,
    options: GMW_FeatureOptionsSet
  ) => Promise<{
    layer: google.maps.Data;
    features: GMW_WrappedFeature[];
  }>;
  setGeoJSONFeature: (
    feature: GeoJSONFeature,
    options: GMW_FeatureOptionsSet
  ) => Promise<GMW_WrappedFeature>;
  zoomToObject: (
    item:
      | GMW_WrappedMarker
      | GMW_WrappedPolygon
      | GMW_WrappedPolyline
      | GMW_WrappedFeature
  ) => void;
  panToObject: (
    item:
      | GMW_WrappedMarker
      | GMW_WrappedPolygon
      | GMW_WrappedPolyline
      | GMW_WrappedFeature
  ) => void;
  setDrawingMode: (
    type: "polyline" | "polygon",
    opts: GMW_PolylineOptions | GMW_PolygonOptions,
    cb: GMW_DrawingCB
  ) => void;
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
  setClusterer: (
    clusterer_options: MarkerClustererOptions
  ) => Promise<MarkerClusterer>;
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
export const WrappedMapBase: React.FunctionComponent<MapBaseProps> = ({
  googleapi_maps_uri,
  default_center,
  default_options,
  default_zoom,
  onDoubleClick,
  onBoundsChanged,
  onCenterChanged,
  onClick,
  onDrag,
  onDragEnd,
  onDragStart,
  onHeadingChanged,
  onIdle,
  onMapTypeIdChanged,
  onMouseMove,
  onMouseOut,
  onMouseOver,
  onProjectionChanged,
  onResize,
  onRightClick,
  onTilesLoaded,
  onTiltChanged,
  onZoomChanged,
  styles,
  initializedCB,
}) => {
  const [script_cache] = useState<any>(
    ScriptCache({
      google: googleapi_maps_uri,
    })
  );

  const [clusterers] = useState<MarkerClusterer[]>([]);
  const [map, setMap] = useState<google.maps.Map>();
  const [do_after_init] = useState<((map: google.maps.Map) => void)[]>([]);
  const [do_on_drag_end] = useState<(() => void)[]>([]);
  const [do_on_drag_start] = useState<(() => void)[]>([]);
  const [drawing_completed_listener, setDrawingCompletedListener] = useState<
    google.maps.MapsEventListener
  >();
  const [features_layer, setFeaturesLayer] = useState<google.maps.Data>();
  const [feature_layers] = useState<google.maps.Data[]>();
  const [map_objects] = useState<MapObjects>({
    marker: {},
    polygon: {},
    polyline: {},
    features: {},
  });
  const [cutting_objects] = useState<CuttingObjects>({});
  const [overlay, setOverlay] = useState<google.maps.OverlayView>();

  const [cutting] = useState<CuttingState>({
    enabled: false,
    id: null,
    indexes: null,
  });
  const [cutting_completed_listener] = useState<
    (segments: [number, number][][] | null) => void
  >();
  const [cancel_drawing] = useState<boolean>(false);
  const [services, setServices] = useState<GMW_Services>();
  const html_element_ref = useRef(null);
  const ic = <T extends any>(
    fn: (map: google.maps.Map) => Promise<T>
  ): Promise<T> =>
    new Promise((resolve, reject) => {
      if (!map) {
        do_after_init.push((map) => {
          fn(map).then(resolve).catch(reject);
        });
      } else {
        fn(map).then(resolve);
      }
    });

  const [funcs, setFuncs] = useState<ExportedFunctions>();

  useEffect(() => {
    if (!html_element_ref.current) {
      throw new Error("html element not found.");
    }

    script_cache.google.onLoad(() => {
      const center = default_center;
      if (!center) {
        throw new Error(
          "Could not create map: Requires 'default_center' prop."
        );
      }
      const zoom = typeof default_zoom !== "undefined" ? default_zoom : null;
      if (!zoom) {
        throw new Error("Could not create map: Requires 'default_zoom' prop.");
      }
      if (!googleapi_maps_uri) {
        throw new Error(
          "Could not create map: Requires 'googleapi_maps_uri' prop. Ex: https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,places,drawing&key=XXXXXXXXXX"
        );
      }
      const defaults = default_options || {};
      const mapConfig = Object.assign({}, defaults, {
        center: new window.google.maps.LatLng(center.lat, center.lng),
        zoom: zoom,
        gestureHandling: "greedy",
        styles: styles || {},
      });
      const maps = window.google.maps;
      const initial_map = new maps.Map(html_element_ref.current, mapConfig);
      setMap(initial_map);
    });
    return () => {
      if (map) {
        window.google.maps.event.clearInstanceListeners(map);
      }
    };
  }, []);
  useEffect(() => {
    if (!map) {
      return;
    }
    const initial_services: GMW_Services = {
      geocoderService: new window.google.maps.Geocoder(),
      directionsService: new window.google.maps.DirectionsService(),
    };
    if (window.google.maps.drawing) {
      initial_services.drawing = window.google.maps.drawing;
      initial_services.drawingManager = new window.google.maps.drawing.DrawingManager(
        {
          drawingMode: null,
          drawingControl: false,
          drawingControlOptions: {
            drawingModes: [],
          },
        }
      );
      initial_services.drawingManager.setMap(map);
    }

    setServices(initial_services);
  }, [map]);
  useEffect(() => {
    if (!map || !services) {
      return;
    }
    setFuncs({
      getBoundsLiteral: () => map_funcs.getBoundsLiteral(map),
      setCenter: (lat_lng) =>
        ic<void>((map) => map_funcs.setCenter(map, lat_lng)),
      toPixel: (lat_lng_pixel) =>
        map_funcs.toPixel(lat_lng_pixel, html_element_ref, overlay),
      setZoom: (zoom_level) => ic((map) => map_funcs.setZoom(zoom_level, map)),
      setPolyline: (id, options) =>
        ic((map) => setPolyline(map, map_objects, cutting, id, options)),
      setPolygon: (id, options) =>
        ic((map: google.maps.Map) =>
          setPolygon(map, map_objects, cutting, id, options)
        ),
      unsetPolyline: (id) =>
        unsetMapObject(map_objects, cutting, "polyline", id),
      unsetPolygon: (id) => unsetMapObject(map_objects, cutting, "polygon", id),
      clearPolylines: () => map_funcs.clearPolylines(map_objects, cutting),
      clearPolygons: () => map_funcs.clearPolygons(map_objects, cutting),
      setMarker: (id, options) =>
        ic((map) => setMarker(map, map_objects, cutting, id, options)),
      unsetMarker: (id) => unsetMapObject(map_objects, cutting, "marker", id),
      clearMarkers: () => map_funcs.clearMarkers(map_objects, cutting),
      setGeoJSONCollection: (collection, options) =>
        ic((map) =>
          feature_helpers.setGeoJSONCollection(
            map,
            map_objects,
            collection,
            options
          )
        ),
      setGeoJSONFeature: (feature, options) =>
        ic((map) => {
          if (!features_layer) {
            throw new Error("features layer not loaded.");
          }
          return feature_helpers.setGeoJSONFeature(
            map,
            map_objects,
            features_layer,
            feature,
            options
          );
        }),
      clearFeatureCollections: () => {
        if (!features_layer || !feature_layers) {
          throw new Error("features/feature layer/layers not loaded.");
        }
        map_funcs.clearFeatureCollections(
          map_objects,
          features_layer,
          feature_layers
        );
      },
      zoomToObject: (item) => map && panZoomToObjectOrFeature(map, item, true),
      panToObject: (item) => map && panZoomToObjectOrFeature(map, item, false),
      setDrawingMode: (type, opts, cb) => {
        map_funcs.setDrawingMode(
          services,
          type,
          opts,
          cb,
          cancel_drawing,
          setDrawingCompletedListener,
          drawing_completed_listener
        );
      },
      cancelDrawingMode: (cancel_drawing, debug_src) =>
        drawing_completed_listener &&
        map_funcs.cancelDrawingMode(
          services,
          cancel_drawing,
          drawing_completed_listener,
          debug_src
        ),
      setCuttingMode: (polyline_id, cb) =>
        drawing_completed_listener &&
        cutting_completed_listener &&
        map_funcs.setCuttingMode(
          services,
          map,
          map_objects,
          cutting,
          cutting_objects,
          default_center,
          cancel_drawing,
          drawing_completed_listener,
          polyline_id,
          cutting_completed_listener,
          cb
        ),
      cuttingPositionUpdate: (mouse_event) =>
        map_funcs.cuttingPositionUpdate(
          mouse_event,
          map_objects,
          cutting,
          cutting_objects
        ),
      cuttingClick: (mouse_event) =>
        map_funcs.cuttingClick(
          mouse_event,
          map,
          map_objects,
          cutting,
          cutting_objects
        ),
      completeCuttingMode: () =>
        cutting_completed_listener &&
        map_funcs.completeCuttingMode(
          map_objects,
          cutting,
          cutting_objects,
          cutting_completed_listener
        ),
      cancelCuttingMode: () =>
        map_funcs.cancelCuttingMode(map_objects, cutting, cutting_objects),
      registerDragStartCB: (cb) => do_on_drag_end.push(cb),
      unregisterDragStartCB: (cb) => {
        const index = do_on_drag_start.indexOf(cb);
        if (index > -1) {
          do_on_drag_start.splice(index, 1);
        }
      },
      registerDragEndCB: (cb) => do_on_drag_end.push(cb),
      unregisterDragEndCB: (cb) => {
        const index = do_on_drag_end.indexOf(cb);
        if (index > -1) {
          do_on_drag_end.splice(index, 1);
        }
      },
      /** *Never use the MarkerClusterer.clearMarkers() function, use the maps unsetClusterer instead!*
       *  NOTE: This will make marker.show() and marker.hide() not function properly, since visibility is controlled by the cluster.
       */
      setClusterer: (clusterer_options) =>
        ic((map) => {
          const clusterer = new MarkerClusterer(map, [], clusterer_options);
          clusterers.push(clusterer);
          return Promise.resolve(clusterer);
        }),
      /** *Never use the MarkerClusterer.clearMarkers() function, use the maps unsetClusterer instead!*
       *  NOTE: This will make marker.show() and marker.hide() not function properly, since visibility is controlled by the cluster.
       */
      getClusterers: () => ic(() => Promise.resolve([...clusterers])),
      unsetClusterer: (clusterer) => {
        clusterer.removeMarkers(clusterer.getMarkers());
        const index = clusterers.indexOf(clusterer);
        if (index > -1) {
          clusterers.splice(index, 1);
        }
      },
      createClustererStyle: (styling: ClusterIconStyle) =>
        MarkerClusterer.withDefaultStyle(styling),
      getServices: () => {
        return services;
      },
    });

    //
    //
    //
    const initial_features_layer = new window.google.maps.Data();
    setFeaturesLayer(initial_features_layer);
    initial_features_layer.setMap(map);
    feature_helpers.setupLayerEvents(map_objects, initial_features_layer);
    //eslint-disable-next-line
    function CanvasProjectionOverlay() {}
    CanvasProjectionOverlay.prototype = new window.google.maps.OverlayView();
    CanvasProjectionOverlay.prototype.constructor = CanvasProjectionOverlay;
    CanvasProjectionOverlay.prototype.onAdd = () => {
      /***/
    };
    CanvasProjectionOverlay.prototype.draw = () => {
      /***/
    };
    CanvasProjectionOverlay.prototype.onRemove = () => {
      /***/
    };
    const initial_overlay = new (CanvasProjectionOverlay as any)(/***/);
    setOverlay(initial_overlay);
    if (initial_overlay) {
      initial_overlay.setMap(map);
    }
  }, [services]);

  useEffect(() => {
    if (!funcs || !map || !features_layer || !services) {
      return;
    }
    setupMapEvents(map);

    window.google.maps.event.addListenerOnce(map, "idle", () =>
      doAfterInit(map)
    );
  }, [funcs, features_layer]);

  const doAfterInit = (map: google.maps.Map): void => {
    do_after_init.forEach((cb) => {
      cb(map);
    });

    if (initializedCB) {
      //Tell parent we are initialized if the parent has asked for it.
      if (!funcs) {
        throw new Error("funcs is undefined");
      }
      initializedCB(map, funcs);
    }
  };

  const setupMapEvents = (map: google.maps.Map): void => {
    map.addListener(
      "center_changed",
      () => onCenterChanged && onCenterChanged()
    );
    map.addListener(
      "bounds_changed",
      () => onBoundsChanged && onBoundsChanged()
    );
    map.addListener("click", (mouse_event) => {
      if (!funcs) {
        throw new Error("funcs is undefined");
      }
      cutting.enabled && funcs.cuttingClick(mouse_event);
      onClick && !cutting.enabled && onClick(mouse_event);
    });
    map.addListener(
      "dblclick",
      (mouse_event) =>
        onDoubleClick && !cutting.enabled && onDoubleClick(mouse_event)
    );
    map.addListener("drag", () => onDrag && !cutting.enabled && onDrag());
    map.addListener(
      "dragend",
      () => onDragEnd && !cutting.enabled && onDragEnd()
    );
    map.addListener("dragstart", () => {
      do_on_drag_start.forEach((cb) => {
        if (!cutting.enabled) {
          cb();
        }
      });
      if (onDragStart && !cutting.enabled) {
        onDragStart();
      }
    });
    map.addListener("heading_changed", () => {
      if (onHeadingChanged) {
        onHeadingChanged();
      }
    });
    map.addListener("idle", () => {
      do_on_drag_end.forEach((cb) => {
        if (!cutting.enabled) {
          cb();
        }
      });
      if (onIdle && !cutting.enabled) {
        onIdle();
      }
    });
    map.addListener("maptypeid_changed", () => {
      if (onMapTypeIdChanged) {
        onMapTypeIdChanged();
      }
    });
    map.addListener("mousemove", (mouse_event: google.maps.MouseEvent) => {
      if (cutting.enabled) {
        if (!funcs) {
          throw new Error("funcs is undefined");
        }
        funcs.cuttingPositionUpdate(mouse_event);
      }
      if (onMouseMove) {
        onMouseMove(mouse_event);
      }
    });
    map.addListener("mouseout", (mouse_event: MouseEvent) => {
      if (onMouseOut) {
        onMouseOut(mouse_event);
      }
    });
    map.addListener("mouseover", (mouse_event: MouseEvent) => {
      if (onMouseOver) {
        onMouseOver(mouse_event);
      }
    });
    map.addListener("projection_changed", () => {
      if (onProjectionChanged) {
        onProjectionChanged();
      }
    });
    map.addListener("reize", () => {
      if (onResize) {
        onResize();
      }
    });
    map.addListener("rightclick", (mouse_event: MouseEvent) => {
      if (onRightClick && !cutting.enabled) {
        onRightClick(mouse_event);
      }
    });
    map.addListener("tilesloaded", () => {
      if (onTilesLoaded) {
        onTilesLoaded();
      }
    });
    map.addListener("tilt_changed", () => {
      if (onTiltChanged) {
        onTiltChanged();
      }
    });
    map.addListener("zoom_changed", () => {
      if (onZoomChanged) {
        onZoomChanged();
      }
    });
  };
  return (
    <div style={{ height: "100%" }}>
      <div
        ref={html_element_ref}
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          right: "0",
          bottom: "0",
        }}
      />
    </div>
  );
};
export default WrappedMapBase;
