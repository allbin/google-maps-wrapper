/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/ban-types */
import React, { useEffect, useRef, useState } from 'react';
import MarkerClusterer, {
  MarkerClustererOptions,
  ClusterIconStyle,
} from '@google/markerclustererplus';
import ScriptCache from './ScriptCache';
import * as feature_helpers from './feature_helpers';
import * as map_funcs from './map_functions';
import {
  panZoomToObjectOrFeature,
  setMarker,
  setPolygon,
  setPolyline,
  unsetMapObject,
} from './internal_helpers';
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
  GMW_LatLngBounds,
  GMW_GeoJSONFeatureCollection,
  GMW_GeoJSONFeature,
} from '.';

// type AnyObjectOptions =
//   | GMW_MarkerOptions
//   | GMW_PolylineOptions
//   | GMW_PolygonOptions;

export interface MapObjects {
  marker: {
    [id: string]: GMW_WrappedMarker;
    [id: number]: GMW_WrappedMarker;
  };
  polygon: {
    [id: string]: GMW_WrappedPolygon;
    [id: number]: GMW_WrappedPolygon;
  };
  polyline: {
    [id: string]: GMW_WrappedPolyline;
    [id: number]: GMW_WrappedPolyline;
  };
  features: {
    [id: string]: GMW_WrappedFeature;
    [id: number]: GMW_WrappedFeature;
  };
}
export interface CuttingState {
  enabled: boolean;
  id: string | number | null;
  indexes: number[] | null;
  arr: GMW_LatLngLiteral[];
}
export interface CuttingObjects {
  [key: string]: any;
  hover_scissors?: any;
}

export type ExportedFunctions = {
  getBoundsLiteral: () => GMW_LatLngBoundsLiteral | undefined;
  getBounds: () => GMW_LatLngBounds | undefined;
  setCenter: (lat_lng: GMW_LatLngLiteral | GMW_LatLng) => Promise<void>;
  setBounds: (
    lat_lng_bounds: GMW_LatLngBoundsLiteral | GMW_LatLngBounds,
  ) => Promise<void>;
  toPixel: (lat_lng_pixel: GMW_LatLng | GMW_LatLngLiteral) => [number, number];
  setZoom: (zoom_level: number) => Promise<void>;
  setPolyline: (
    id: string | number,
    options: GMW_PolylineOptionsSet,
  ) => Promise<GMW_WrappedPolyline>;
  setPolygon: (
    id: string | number,
    options: GMW_PolygonOptionsSet,
  ) => Promise<GMW_WrappedPolygon>;
  unsetPolyline: (id: string | number) => Promise<boolean>;
  unsetPolygon: (id: string | number) => Promise<boolean>;
  unsetMarker: (id: string | number) => Promise<boolean>;
  clearPolylines: () => Promise<boolean[]>;
  clearPolygons: () => Promise<boolean[]>;
  clearFeatureCollections: (
    map_objects: MapObjects,
    feature_layer: google.maps.Data,
    feature_layers: google.maps.Data[],
  ) => void;
  setMarker: (
    id: string | number,
    options: GMW_MarkerOptionsSet,
  ) => Promise<GMW_WrappedMarker>;
  clearMarkers: () => Promise<boolean[]>;
  setGeoJSONCollection: (
    collection: GMW_GeoJSONFeatureCollection,
    options: GMW_FeatureOptionsSet,
  ) => Promise<{
    layer: google.maps.Data;
    features: GMW_WrappedFeature[];
  }>;
  setGeoJSONFeature: (
    feature: GMW_GeoJSONFeature,
    options: GMW_FeatureOptionsSet,
  ) => Promise<GMW_WrappedFeature>;
  zoomToObject: (
    item:
      | GMW_WrappedMarker
      | GMW_WrappedPolygon
      | GMW_WrappedPolyline
      | GMW_WrappedFeature,
  ) => void;
  panToObject: (
    item:
      | GMW_WrappedMarker
      | GMW_WrappedPolygon
      | GMW_WrappedPolyline
      | GMW_WrappedFeature,
  ) => void;
  setDrawingMode: (
    type: 'polyline' | 'polygon',
    opts: GMW_PolylineOptions | GMW_PolygonOptions,
    cb: GMW_DrawingCB,
  ) => void;
  cancelDrawingMode: (debug_src?: string) => void;
  setCuttingMode: (
    polyline_id: string | number,
    cb?: (segments: GMW_LatLngLiteral[][] | null) => void,
  ) => void;
  cuttingPositionUpdate: (mouse_event: google.maps.MouseEvent) => void;
  cuttingClick: (mouse_event: google.maps.MouseEvent) => void;
  completeCuttingMode: () => GMW_LatLngLiteral[][];
  cancelCuttingMode: () => void;
  registerDragStartCB: (cb: () => void) => number;
  unregisterDragStartCB: (cb: () => void) => void;
  registerDragEndCB: (cb: () => void) => number;
  unregisterDragEndCB: (cb: () => void) => void;
  getClusterers: () => Promise<MarkerClusterer[]>;
  setClusterer: (
    clusterer_options: MarkerClustererOptions,
  ) => Promise<MarkerClusterer>;
  unsetClusterer: (clusterer: MarkerClusterer) => void;
  createClustererStyle: typeof MarkerClusterer.withDefaultStyle;
  /** Ensure to only use after map initialization. */
  getServices: () => GMW_Services;
};

interface DrawingListenerObject {
  listener?: google.maps.MapsEventListener;
  cancel: boolean;
}
interface CuttingListenerObject {
  listener?: (segments: GMW_LatLngLiteral[][] | null) => void;
  cancel: boolean;
}
interface EventCallbacks {
  onCenterChanged?: () => void;
  onBoundsChanged?: () => void;
  onClick?: (e: google.maps.MouseEvent) => void;
  onDoubleClick?: (e: google.maps.MouseEvent) => void;
  onDrag?: () => void;
  onDragEnd?: () => void;
  onDragStart?: () => void;
  onHeadingChanged?: () => void;
  onIdle?: () => void;
  onMapTypeIdChanged?: () => void;
  onMouseMove?: (e: google.maps.MouseEvent) => void;
  onMouseOut?: (e: google.maps.MouseEvent) => void;
  onMouseOver?: (e: google.maps.MouseEvent) => void;
  onProjectionChanged?: () => void;
  onResize?: () => void;
  onRightClick?: (e: google.maps.MouseEvent) => void;
  onTilesLoaded?: () => void;
  onTiltChanged?: () => void;
  onZoomChanged?: () => void;
}
type CallbackName = keyof EventCallbacks;

export interface MapBaseProps extends EventCallbacks {
  initializedCB?: (map: google.maps.Map, funcs: ExportedFunctions) => void;
  googleapi_maps_uri: string;
  id?: string;
  default_center: GMW_LatLngLiteral;
  default_zoom: number;
  default_options?: object;
  styles?: object;
  verbose?: true;
}

const basic_event_names = [
  'center_changed',
  'heading_changed',
  'maptypeid_changed',
  'projection_changed',
  'resize',
  'tilesloaded',
  'tilt_changed',
  'zoom_changed',
  'mouseout',
  'mouseover',
  'bounds_changed',
];

const event_name_to_callback_name: {
  [key: string]: CallbackName;
} = {
  center_changed: 'onCenterChanged',
  bounds_changed: 'onBoundsChanged',
  heading_changed: 'onHeadingChanged',
  maptypeid_changed: 'onMapTypeIdChanged',
  projection_changed: 'onProjectionChanged',
  resize: 'onResize',
  tilesloaded: 'onTilesLoaded',
  tilt_changed: 'onTiltChanged',
  zoom_changed: 'onZoomChanged',
  mouseout: 'onMouseOut',
  mousemove: 'onMouseMove',
  mouseover: 'onMouseOver',
  rightclick: 'onRightClick',
  idle: 'onIdle',
  drag: 'onDrag',
  dragstart: 'onDragStart',
  dragend: 'onDragEnd',
  click: 'onClick',
};

const onMapEvent = (
  event_callbacks: EventCallbacks,
  event_name: CallbackName,
  e?: any,
): void => {
  const cb = event_callbacks[event_name];
  cb && cb(e);
};

export const WrappedMapBase: React.FunctionComponent<MapBaseProps> = (
  props,
) => {
  const {
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
  } = props;

  const [script_cache] = useState<any>(
    ScriptCache({
      google: googleapi_maps_uri,
    }),
  );

  const verbose = props.verbose || false;

  const [clusterers] = useState<MarkerClusterer[]>([]);
  const [map, setMap] = useState<google.maps.Map>();
  const [do_after_init] = useState<((map: google.maps.Map) => void)[]>([]);
  const [do_on_drag_end] = useState<(() => void)[]>([]);
  const [do_on_drag_start] = useState<(() => void)[]>([]);
  const [drawing_completed_listener] = useState<DrawingListenerObject>({
    cancel: false,
  });
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
    arr: [],
  });
  const [cutting_completed_listener] = useState<CuttingListenerObject>({
    cancel: false,
  });
  const [services, setServices] = useState<GMW_Services>();
  const html_element_ref = useRef(null);
  const [funcs, setFuncs] = useState<ExportedFunctions>();
  const [event_callbacks] = useState<EventCallbacks>({});

  const ic = <T extends any>(
    fn: (map: google.maps.Map) => Promise<T>,
  ): Promise<T> =>
    new Promise((resolve, reject) => {
      if (!map) {
        do_after_init.push((map) => {
          fn(map).then(resolve).catch(reject);
        });
      } else {
        void fn(map).then(resolve);
      }
    });

  useEffect(() => {
    if (!html_element_ref.current) {
      throw new Error('html element not found.');
    }

    script_cache.google.onLoad(() => {
      const center = default_center;
      if (!center) {
        throw new Error(
          "Could not create map: Requires 'default_center' prop.",
        );
      }
      const zoom = typeof default_zoom !== 'undefined' ? default_zoom : null;
      if (!zoom) {
        throw new Error("Could not create map: Requires 'default_zoom' prop.");
      }
      if (!googleapi_maps_uri) {
        throw new Error(
          "Could not create map: Requires 'googleapi_maps_uri' prop. Ex: https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,places,drawing&key=XXXXXXXXXX",
        );
      }
      const defaults = default_options || {};
      const mapConfig = Object.assign({}, defaults, {
        center: new window.google.maps.LatLng(center.lat, center.lng),
        zoom: zoom,
        gestureHandling: 'greedy',
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
      places:
        window.google.maps.places &&
        new window.google.maps.places.PlacesService(map),
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
        },
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
      getBounds: () => map_funcs.getBounds(map),
      setCenter: (lat_lng) =>
        ic<void>((map) => map_funcs.setCenter(map, lat_lng)),
      setBounds: (lat_lng) =>
        ic<void>((map) => map_funcs.setBounds(map, lat_lng)),
      toPixel: (lat_lng_pixel) =>
        map_funcs.toPixel(lat_lng_pixel, html_element_ref, overlay),
      setZoom: (zoom_level) => ic((map) => map_funcs.setZoom(zoom_level, map)),
      setPolyline: (id, options) =>
        ic((map) =>
          setPolyline(verbose, map, map_objects, cutting, id, options),
        ),
      setPolygon: (id, options) =>
        ic((map: google.maps.Map) =>
          setPolygon(verbose, map, map_objects, cutting, id, options),
        ),
      unsetPolyline: (id) =>
        unsetMapObject(verbose, map_objects, cutting, 'polyline', id),
      unsetPolygon: (id) =>
        unsetMapObject(verbose, map_objects, cutting, 'polygon', id),
      clearPolylines: () =>
        map_funcs.clearPolylines(verbose, map_objects, cutting),
      clearPolygons: () =>
        map_funcs.clearPolygons(verbose, map_objects, cutting),
      setMarker: (id, options) =>
        ic((map) => setMarker(verbose, map, map_objects, cutting, id, options)),
      unsetMarker: (id) =>
        unsetMapObject(verbose, map_objects, cutting, 'marker', id),
      clearMarkers: () => map_funcs.clearMarkers(verbose, map_objects, cutting),
      setGeoJSONCollection: (collection, options) =>
        ic((map) =>
          feature_helpers.setGeoJSONCollection(
            map,
            map_objects,
            collection,
            options,
          ),
        ),
      setGeoJSONFeature: (feature, options) =>
        ic((map) => {
          if (!features_layer) {
            throw new Error('features layer not loaded.');
          }
          return feature_helpers.setGeoJSONFeature(
            map,
            map_objects,
            features_layer,
            feature,
            options,
          );
        }),
      clearFeatureCollections: () => {
        if (!features_layer || !feature_layers) {
          throw new Error('features/feature layer/layers not loaded.');
        }
        map_funcs.clearFeatureCollections(
          map_objects,
          features_layer,
          feature_layers,
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
          drawing_completed_listener,
        );
      },
      cancelDrawingMode: (debug_src) => {
        if (!drawing_completed_listener.listener) {
          if (debug_src) {
            console.log(
              'Cancel drawing before listener was attached, call from: ' +
              debug_src,
            );
          }
          return;
        }

        map_funcs.endDrawingMode(
          services,
          drawing_completed_listener,
          true,
          debug_src,
        );
      },
      setCuttingMode: (polyline_id, cb) => {
        console.log('polyline_id:', polyline_id);
        drawing_completed_listener &&
          cutting_completed_listener &&
          map_funcs.setCuttingMode(
            services,
            map,
            map_objects,
            cutting,
            cutting_objects,
            default_center,
            drawing_completed_listener,
            polyline_id,
            cutting_completed_listener,
            cb,
          );
      },
      cuttingPositionUpdate: (mouse_event) =>
        map_funcs.cuttingPositionUpdate(
          mouse_event,
          map_objects,
          cutting,
          cutting_objects,
        ),
      cuttingClick: (mouse_event) =>
        map_funcs.cuttingClick(
          mouse_event,
          map,
          map_objects,
          cutting,
          cutting_objects,
        ),
      completeCuttingMode: () =>
        (cutting_completed_listener &&
          map_funcs.completeCuttingMode(
            map_objects,
            cutting,
            cutting_objects,
            cutting_completed_listener,
          )) ||
        [],
      cancelCuttingMode: () => {
        map_funcs.cancelCuttingMode(
          map_objects,
          cutting,
          cutting_objects,
          cutting_completed_listener,
        );
      },
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
    function CanvasProjectionOverlay() { }
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
    basic_event_names.forEach((event_name) => {
      map.addListener(event_name, (e) =>
        onMapEvent(event_callbacks, event_name_to_callback_name[event_name], e),
      );
    });

    map.addListener('click', (mouse_event) => {
      if (!funcs) {
        throw new Error('funcs is undefined');
      }
      cutting.enabled && funcs.cuttingClick(mouse_event);
      !cutting.enabled && onMapEvent(event_callbacks, 'onClick', mouse_event);
    });
    map.addListener(
      'dblclick',
      (mouse_event) =>
        !cutting.enabled &&
        onMapEvent(event_callbacks, 'onDoubleClick', mouse_event),
    );
    map.addListener(
      'drag',
      () => !cutting.enabled && onMapEvent(event_callbacks, 'onDrag'),
    );
    map.addListener(
      'dragend',
      () => !cutting.enabled && onMapEvent(event_callbacks, 'onDragEnd'),
    );
    map.addListener('dragstart', () => {
      do_on_drag_start.forEach((cb) => {
        if (!cutting.enabled) {
          cb();
        }
      });
      !cutting.enabled && onMapEvent(event_callbacks, 'onDragStart');
    });

    map.addListener('idle', () => {
      do_on_drag_end.forEach((cb) => {
        if (!cutting.enabled) {
          cb();
        }
      });
      !cutting.enabled && onMapEvent(event_callbacks, 'onIdle');
    });
    map.addListener('mousemove', (mouse_event: google.maps.MouseEvent) => {
      if (cutting.enabled) {
        if (!funcs) {
          throw new Error('funcs is undefined');
        }
        funcs.cuttingPositionUpdate(mouse_event);
      }
      onMapEvent(event_callbacks, 'onMouseMove', mouse_event);
    });

    map.addListener('rightclick', (mouse_event: google.maps.MouseEvent) => {
      !cutting.enabled &&
        onMapEvent(event_callbacks, 'onRightClick', mouse_event);
    });

    window.google.maps.event.addListenerOnce(map, 'idle', () =>
      doAfterInit(map),
    );
  }, [funcs, features_layer]);

  useEffect(() => {
    if (!funcs || !map || !features_layer || !services) {
      return;
    }
    const cb_names: CallbackName[] = [
      'onDoubleClick',
      'onBoundsChanged',
      'onCenterChanged',
      'onClick',
      'onDrag',
      'onDragEnd',
      'onDragStart',
      'onHeadingChanged',
      'onIdle',
      'onMapTypeIdChanged',
      'onMouseMove',
      'onMouseOut',
      'onMouseOver',
      'onProjectionChanged',
      'onResize',
      'onRightClick',
      'onTilesLoaded',
      'onTiltChanged',
      'onZoomChanged',
    ];
    cb_names.forEach((cb_name) => {
      (event_callbacks[cb_name] as any) = props[cb_name] as any;
    });
  }, [
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
  ]);

  const doAfterInit = (map: google.maps.Map): void => {
    do_after_init.forEach((cb) => {
      cb(map);
    });

    if (initializedCB) {
      //Tell parent we are initialized if the parent has asked for it.
      if (!funcs) {
        throw new Error('funcs is undefined');
      }
      initializedCB(map, funcs);
    }
  };

  return (
    <div style={{ height: '100%' }}>
      <div
        ref={html_element_ref}
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
        }}
      />
    </div>
  );
};
export default WrappedMapBase;
