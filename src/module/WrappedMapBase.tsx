import * as React from "react";
import { useEffect, useRef, useState } from "react";
import ScriptCache from "./ScriptCache";
import * as feature_helpers from "./feature_helpers";
import * as map_funcs from "./map_functions";
import { cuttingClick } from "./map_functions";
import { cuttingPositionUpdate } from "./map_functions";

type ExportedFunctions = {
  getBoundsLiteral: () => LatLngBoundsLiteral | undefined;
  setCenter: (lat_lng: LatLngLiteral | LatLng) => Promise<void>;
  toPixel: (lat_lng_pixel: LatLng | LatLngLiteral) => [number, number];
  setZoom: (zoom_level: number) => Promise<void>;
  setPolyline: (
    id: string | number,
    options: PolylineEvents
  ) => Promise<WrappedFeature>;
  setPolygon: (
    id: string | number,
    options: PolygonEvents
  ) => Promise<WrappedPolygon>;
};

export interface MapBaseProps {
  initializedCB?: (ref: any) => void;
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
export const WrappedMapBase: React.FunctionComponent<MapBaseProps> = ({
  googleapi_maps_uri,
  id,
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
  initializedCB
}) => {
  const [script_cache] = useState<any>(
    ScriptCache({
      google: googleapi_maps_uri
    })
  );

  const [map, setMap] = useState<google.maps.Map>();
  const [initialized, setInitialized] = useState<boolean>(false);
  const [do_after_init] = useState<(() => void)[]>([]);
  const [do_on_drag_end] = useState<(() => void)[]>([]);
  const [do_on_drag_start] = useState<(() => void)[]>([]);
  const [drawing_completed_listener] = useState<
    google.maps.MapsEventListener
  >();
  const [features_layer, setFeatureLayers] = useState<google.maps.Data>();
  const [feature_layers] = useState<google.maps.Data[]>([]);
  const [map_objects] = useState<{
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
  }>({
    marker: {},
    polygon: {},
    polyline: {},
    features: {}
  });
  const [cutting_objects] = useState<{
    [key: string]: any;
    hover_scissors?: any;
  }>({});
  const [overlay, setOverlay] = useState<google.maps.OverlayView>();

  const [cutting] = useState<{
    enabled: boolean;
    id: string | number | null;
    indexes: number[] | null;
    arr?: [number, number][];
  }>({
    enabled: false,
    id: null,
    indexes: null
  });
  const [cutting_completed_listener] = useState<
    (segments: [number, number][][] | null) => void
  >();
  const [cancel_drawing] = useState<boolean>(false);
  const [services, setServices] = useState<any>({});
  const map_ref = useRef(null);
  const ic = <T extends any>(fn: () => Promise<T>): Promise<T> =>
    new Promise((resolve, reject) => {
      if (!initialized) {
        do_after_init.push(() => {
          fn()
            .then(resolve)
            .catch(reject);
        });
      } else {
        fn().then(resolve);
      }
    });
  useEffect(() => {
    if (map && initialized) {
      window.google.maps.event.clearInstanceListeners(map);
    }

    if (id) {
      if (window.hasOwnProperty("allbin_gmaps")) {
        window.wrapped_gmaps[id] = map_ref;
      }
    }
    script_cache.google.onLoad(() => {
      function CanvasProjectionOverlay() {}

      CanvasProjectionOverlay.prototype = new window.google.maps.OverlayView();
      CanvasProjectionOverlay.prototype.constructor = CanvasProjectionOverlay;
      CanvasProjectionOverlay.prototype.onAdd = function() {};
      CanvasProjectionOverlay.prototype.draw = function() {};
      CanvasProjectionOverlay.prototype.onRemove = function() {};

      let center = default_center;
      if (!center) {
        throw new Error(
          "Could not create map: Requires 'default_center' prop."
        );
      }
      let zoom = typeof default_zoom !== "undefined" ? default_zoom : null;
      if (!zoom) {
        throw new Error("Could not create map: Requires 'default_zoom' prop.");
      }
      if (!googleapi_maps_uri) {
        throw new Error(
          "Could not create map: Requires 'googleapi_maps_uri' prop. Ex: https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,places,drawing&key=XXXXXXXXXX"
        );
      }
      let defaults = default_options || {};
      let mapConfig = Object.assign({}, defaults, {
        center: new window.google.maps.LatLng(center.lat, center.lng),
        zoom: zoom,
        gestureHandling: "greedy",
        styles: styles || {}
      });
      const maps = window.google.maps;

      setMap(maps.Map(map_ref.current, mapConfig));
      setFeatureLayers(new maps.Data());
      if (features_layer) {
        features_layer.setMap(map ? map : null);
        feature_helpers.setupLayerEvents(map_ref, features_layer);
      }
      setServices({
        geocoderService: new window.google.maps.Geocoder(),
        directionsService: new window.google.maps.DirectionsService()
      });
      if (window.google.maps.drawing) {
        setServices(
          Object.assign({}, services, {
            drawing: window.google.maps.drawing,
            drawingManager: new window.google.maps.drawing.DrawingManager({
              drawingMode: null,
              drawingControl: false,
              drawingControlOptions: {
                drawingModes: []
              }
            })
          })
        );
        services.drawingManager.setMap(map);
      }

      setOverlay(new (CanvasProjectionOverlay as any)());
      if (overlay) {
        overlay.setMap(map ? map : null);
      }
      if (!map) {
        throw new Error(
          "Tried to setup events before map instance was defined."
        );
      }
      setupMapEvents(map);

      window.google.maps.event.addListenerOnce(map, "idle", () =>
        doAfterInit()
      );
    });
  }, []);

  const doAfterInit = (): void => {
    setInitialized(true);
    do_after_init.forEach(cb => {
      cb();
    });

    if (initializedCB) {
      //Tell parent we are initialized if the parent has asked for it.
      initializedCB(this);
    }
  };
  const [funcs] = useState({
    getBoundsLiteral: () => map_funcs.getBoundsLiteral(map),
    setCenter: lat_lng => ic<void>(() => map_funcs.setCenter(map, lat_lng)),
    toPixel: lat_lng_pixel => map_funcs.toPixel(lat_lng_pixel)
  } as ExportedFunctions);

  const setupMapEvents = (map: google.maps.Map) => {
    map.addListener(
      "center_changed",
      () => onCenterChanged && onCenterChanged()
    );
    map.addListener(
      "bounds_changed",
      () => onBoundsChanged && onBoundsChanged()
    );
    map.addListener("click", mouse_event => {
      cutting.enabled && cuttingClick(mouse_event);
      onClick && !cutting.enabled && onClick(mouse_event);
    });
    map.addListener(
      "dblclick",
      mouse_event =>
        onDoubleClick && !cutting.enabled && onDoubleClick(mouse_event)
    );
    map.addListener("drag", () => onDrag && !cutting.enabled && onDrag());
    map.addListener(
      "dragend",
      () => onDragEnd && !cutting.enabled && onDragEnd()
    );
    map.addListener("dragstart", () => {
      do_on_drag_start.forEach(cb => {
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
      do_on_drag_end.forEach(cb => {
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
    map.addListener("mousemove", (mouse_event: MouseEvent) => {
      if (cutting.enabled) {
        cuttingPositionUpdate(mouse_event);
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
        ref={map_ref}
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          right: "0",
          bottom: "0"
        }}
      />
    </div>
  );
};
export default WrappedMapBase;
