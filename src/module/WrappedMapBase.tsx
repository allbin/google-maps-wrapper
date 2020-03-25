import * as React from "react";
import {
  arrayToLatLngObject,
  arrayToLatLngObjectType,
  convertFromArrayOfArray,
  convertFromArrayOfArrayType,
  haversineDistance,
  haversineDistanceType,
  latLngArrayToCoordArray,
  latLngArrayToCoordArrayType,
  makePointsAroundCircleRT90,
  makePointsAroundCircleRT90Type,
  makeRectRT90,
  makeRectRT90Type,
  movePointsByCoord,
  movePointsByCoordType,
  MVCArrayToCoordArray,
  MVCArrayToCoordArrayType,
  MVCArrayToObjArray,
  MVCArrayToObjArrayType
} from "./external_helpers";
import ScriptCache from "./ScriptCache";
import * as ReactDOM from "react-dom";
const ScissorIcon = require("./img/marker_scissors.svg");
const ScissorHoverIcon = require("./img/marker_scissors_hover.svg");
import * as internal_helpers from "./internal_helpers";
import * as feature_helpers from "./feature_helpers";
import { GoogleMapsWrapper } from "google_maps_wrapper";
import WrappedMarker = GoogleMapsWrapper.WrappedMarker;
import WrappedPolygon = GoogleMapsWrapper.WrappedPolygon;
import WrappedPolyline = GoogleMapsWrapper.WrappedPolyline;
import WrappedFeature = GoogleMapsWrapper.WrappedFeature;
import LatLngLiteral = GoogleMapsWrapper.LatLngLiteral;
import LatLngBoundsLiteral = GoogleMapsWrapper.LatLngBoundsLiteral;
import LatLng = GoogleMapsWrapper.LatLng;
import PolylineOptionsSet = GoogleMapsWrapper.PolylineOptionsSet;
import PolygonOptionsSet = GoogleMapsWrapper.PolygonOptionsSet;
import MarkerOptionsSet = GoogleMapsWrapper.MarkerOptionsSet;
import GeoJSONFeatureCollection = GoogleMapsWrapper.GeoJSONFeatureCollection;
import FeatureOptionsSet = GoogleMapsWrapper.FeatureOptionsSet;
import PolylineOptions = GoogleMapsWrapper.PolylineOptions;
import PolygonOptions = GoogleMapsWrapper.PolygonOptions;
import Marker = GoogleMapsWrapper.Marker;
import Polyline = GoogleMapsWrapper.Polyline;
import Polygon = GoogleMapsWrapper.Polygon;
import GeoJSONFeature = GoogleMapsWrapper.GeoJSONFeature;
import { useEffect, useState } from "react";

const CUTTING_SNAP_DISTANCE = 200;
const Z_INDEX_SCISSORS = 9001;
const Z_INDEX_SCISSORS_HOVER = 9002;

interface MapBaseProps {
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
const WrappedMapBase: React.FunctionComponent<MapBaseProps> = ({
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
  const [cutting, setCutting] = useEffect(() => {
    const script_cache = ScriptCache({
      google: googleapi_maps_uri
    });
    this.initialized = true;
    this.do_after_init.forEach(cb => {
      cb();
    });

    if (initializedCB) {
      //Tell parent we are initialized if the parent has asked for it.
      initializedCB(this);
    }
    return () => {
      if (this.map && this.initialized) {
        window.google.maps.event.clearInstanceListeners(this.map);
      }

      const refs = this.refs;
      if (id) {
        if (window.hasOwnProperty("allbin_gmaps")) {
          window.wrapped_gmaps[id] = this;
        }
      }
      this.script_cache.google.onLoad(() => {
        function CanvasProjectionOverlay() {}
        CanvasProjectionOverlay.prototype = new window.google.maps.OverlayView();
        CanvasProjectionOverlay.prototype.constructor = CanvasProjectionOverlay;
        CanvasProjectionOverlay.prototype.onAdd = function() {};
        CanvasProjectionOverlay.prototype.draw = function() {};
        CanvasProjectionOverlay.prototype.onRemove = function() {};

        const mapRef = refs.map;
        this.html_element = ReactDOM.findDOMNode(mapRef);

        let center = default_center;
        if (!center) {
          throw new Error(
            "Could not create map: Requires 'default_center' prop."
          );
        }
        let zoom =
          typeof default_zoom !== "undefined"
            ? default_zoom
            : null;
        if (!zoom) {
          throw new Error(
            "Could not create map: Requires 'default_zoom' prop."
          );
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

        this.map = new maps.Map(this.html_element, mapConfig);
        this.features_layer = new maps.Data();
        if (this.features_layer) {
          this.features_layer.setMap(this.map);
          feature_helpers.setupLayerEvents(this, this.features_layer);
        }
        this.services = {
          geocoderService: new window.google.maps.Geocoder(),
          directionsService: new window.google.maps.DirectionsService()
        };
        if (window.google.maps.drawing) {
          this.services.drawing = window.google.maps.drawing;
          this.services.drawingManager = new window.google.maps.drawing.DrawingManager(
            {
              drawingMode: null,
              drawingControl: false,
              drawingControlOptions: {
                drawingModes: []
              }
            }
          );
          this.services.drawingManager.setMap(this.map);
        }

        this.overlay = new (CanvasProjectionOverlay as any)();
        if (this.overlay) {
          this.overlay.setMap(this.map);
        }
        if (!this.map) {
          throw new Error(
            "Tried to setup events before map instance was defined."
          );
        }
        this.setupMapEvents(this.map);

        window.google.maps.event.addListenerOnce(this.map, "idle", () => {
          this.doAfterInit();
        });
      });
    };
  }, []);

  const getBoundsLiteral = () => {
    if (!this.map) {
      return null;
    }
    const bounds = this.map.getBounds();
    if (!bounds) {
      return null;
    }
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    return {
      north: ne.lat(),
      east: ne.lng(),
      south: sw.lat(),
      west: sw.lng()
    };
  };

  const setCenter = (latLng: LatLngLiteral | LatLng): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!this.initialized) {
        this.do_after_init.push(() => {
          this.setCenter(latLng)
            .then(res => {
              resolve(res);
            })
            .catch(err => {
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
  };

  const fitToBoundsArray = (arr_of_coords: [number, number][]) =>
    internal_helpers.fitToBoundsOfArray(this, arr_of_coords);
  const fitToBoundsLiteral = (bounds: LatLngBoundsLiteral) =>
    internal_helpers.fitToBoundsLiteral(this, bounds);
  const fitToBoundsObjectArray = (arr_of_objects: LatLngLiteral[]) =>
    internal_helpers.fitToBoundsOfObjectArray(this, arr_of_objects);

  const fromLatLngToPixel = (map_ref: WrappedMapBase, latLng: LatLng) =>
    internal_helpers.fromLatLngToPixel(this, latLng);

  const toPixel = (lat_lng_input: LatLng | LatLngLiteral): [number, number] => {
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
    let pixel_obj = this.overlay
      .getProjection()
      .fromLatLngToContainerPixel(lat_lng);
    return [pixel_obj.x + node_rect.left, pixel_obj.y + node_rect.top];
  };

  const setZoom = (zoom_level: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!this.initialized) {
        this.do_after_init.push(() => {
          this.setZoom(zoom_level)
            .then(res => {
              resolve(res);
            })
            .catch(err => {
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
  };

  const setPolyline = (
    id: string | number,
    options: PolylineOptionsSet
  ): Promise<WrappedPolyline> =>
    internal_helpers.setPolyline(this, id, options);
  const unsetPolyline = (id: string | number): Promise<boolean> =>
    internal_helpers.unsetMapObject(this, "polyline", id);
  const clearPolylines = (): Promise<boolean[]> => {
    let promise_arr: Promise<boolean>[] = [];
    Object.keys(this.map_objects.polyline).forEach(id => {
      promise_arr.push(internal_helpers.unsetMapObject(this, "polyline", id));
    });
    return Promise.all(promise_arr);
  };

  const setPolygon = (
    id: string | number,
    options: PolygonOptionsSet
  ): Promise<WrappedPolygon> => internal_helpers.setPolygon(this, id, options);
  const unsetPolygon = (id: string | number): Promise<boolean> =>
    internal_helpers.unsetMapObject(this, "polygon", id);
  const clearPolygons = (): Promise<boolean[]> => {
    let promise_arr: Promise<boolean>[] = [];
    Object.keys(this.map_objects.polygon).forEach(id => {
      promise_arr.push(internal_helpers.unsetMapObject(this, "polygon", id));
    });
    return Promise.all(promise_arr);
  };

  const setMarker = (
    id: string | number,
    options: MarkerOptionsSet
  ): Promise<WrappedMarker> => internal_helpers.setMarker(this, id, options);
  const unsetMarker = (id: string | number): Promise<boolean> =>
    internal_helpers.unsetMapObject(this, "marker", id);
  const clearMarkers = (): Promise<boolean[]> => {
    let promise_arr: Promise<boolean>[] = [];
    Object.keys(this.map_objects.marker).forEach(id => {
      promise_arr.push(internal_helpers.unsetMapObject(this, "marker", id));
    });
    return Promise.all(promise_arr);
  };

  const setGeoJSONCollection = (
    collection: GeoJSONFeatureCollection,
    options: FeatureOptionsSet
  ) => feature_helpers.setGeoJSONCollection(this, collection, options);
  const setGeoJSONFeature = (
    feature: GeoJSONFeature,
    options: FeatureOptionsSet
  ) => feature_helpers.setGeoJSONFeature(this, feature, options);
  const clearFeatureCollections = () => {
    this.feature_layers.forEach(x => x.setMap(null));
    this.feature_layers = [];
    if (this.features_layer) {
      Object.keys(this.map_objects.features).forEach(feature_key => {
        this.map_objects.features[feature_key].remove();
      });
    }
  };

  const zoomToObject = (
    item: WrappedMarker | WrappedPolygon | WrappedPolyline | WrappedFeature
  ) => internal_helpers.panZoomToObjectOrFeature(this, item, true);
  const panToObject = (
    item: WrappedMarker | WrappedPolygon | WrappedPolyline | WrappedFeature
  ) => internal_helpers.panZoomToObjectOrFeature(this, item, false);

  //Is actually triggered by Idle, not DragEnd!
  const registerDragEndCB = (cb: () => void): void =>
    this.do_on_drag_end.push(cb);

  const unregisterDragEndCB = (cb: () => void) => {
    let index = this.do_on_drag_end.indexOf(cb);
    if (index > -1) {
      this.do_on_drag_end.splice(index, 1);
    }
  };
  const registerDragStartCB = (cb: () => void) => this.do_on_drag_end.push(cb);
  const unregisterDragStartCB = (cb: () => void) => {
    let index = this.do_on_drag_start.indexOf(cb);
    if (index > -1) {
      this.do_on_drag_start.splice(index, 1);
    }
  };
  const setupMapEvents = (map: google.maps.Map) => {
    map.addListener("center_changed", () => {
      if (onCenterChanged) {
        onCenterChanged();
      }
    });
    map.addListener("bounds_changed", () => {
      if (onBoundsChanged) {
        onBoundsChanged();
      }
    });
    map.addListener("click", mouse_event => {
      if (this.cutting.enabled) {
        this.cuttingClick(mouse_event);
      }
      if (onClick && !this.cutting.enabled) {
        onClick(mouse_event);
      }
    });
    map.addListener("dblclick", mouse_event => {
      if (onDoubleClick && !this.cutting.enabled) {
        onDoubleClick(mouse_event);
      }
    });
    map.addListener("drag", () => {
      if (onDrag && !this.cutting.enabled) {
        onDrag();
      }
    });
    map.addListener("dragend", () => {
      if (onDragEnd && !this.cutting.enabled) {
        onDragEnd();
      }
    });
    map.addListener("dragstart", () => {
      this.do_on_drag_start.forEach(cb => {
        if (!this.cutting.enabled) {
          cb();
        }
      });
      if (onDragStart && !this.cutting.enabled) {
        onDragStart();
      }
    });
    map.addListener("heading_changed", () => {
      if (onHeadingChanged) {
        onHeadingChanged();
      }
    });
    map.addListener("idle", () => {
      this.do_on_drag_end.forEach(cb => {
        if (!this.cutting.enabled) {
          cb();
        }
      });
      if (onIdle && !this.cutting.enabled) {
        onIdle();
      }
    });
    map.addListener("maptypeid_changed", () => {
      if (onMapTypeIdChanged) {
        onMapTypeIdChanged();
      }
    });
    map.addListener(
      "mousemove",
      (mouse_event: GoogleMapsWrapper.MouseEvent) => {
        if (this.cutting.enabled) {
          this.cuttingPositionUpdate(mouse_event);
        }
        if (onMouseMove) {
          onMouseMove(mouse_event);
        }
      }
    );
    map.addListener("mouseout", (mouse_event: GoogleMapsWrapper.MouseEvent) => {
      if (onMouseOut) {
        onMouseOut(mouse_event);
      }
    });
    map.addListener(
      "mouseover",
      (mouse_event: GoogleMapsWrapper.MouseEvent) => {
        if (onMouseOver) {
          onMouseOver(mouse_event);
        }
      }
    );
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
      if (onRightClick && !this.cutting.enabled) {
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

  const setDrawingMode = (
    type: "polyline" | "polygon",
    opts: PolylineOptions | PolygonOptions,
    cb: (
      path: [number, number][] | [number, number] | null,
      overlay: Polygon | Polyline | Marker
    ) => void
  ) => {
    let mode = null;
    if (!this.services.drawing) {
      console.error(
        "MAP: Drawing library not available! Add it to google maps api request url."
      );
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
      "overlaycomplete",
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
          if (cb) {
            cb(path as [number, number][], overlay);
          }
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
  };
  const completeDrawingMode = () => {
    if (this.services.drawing) {
      this.services.drawingManager.setOptions({ drawingMode: null });
    }
    if (this.drawing_completed_listener) {
      this.drawing_completed_listener.remove();
      this.drawing_completed_listener = null;
    }
  };
  const cancelDrawingMode = (debug_src?: string) => {
    if (debug_src) {
      console.log("cancel drawing mode:", debug_src);
    }
    if (this.services.drawing && this.drawing_completed_listener) {
      this.cancel_drawing = true;
      this.services.drawingManager.setOptions({ drawingMode: null });
    }
  };

  const setCuttingMode = (polyline_id: string | number, cb = null) => {
    if (!this.map_objects.polyline.hasOwnProperty(polyline_id)) {
      console.error(
        "MAP: Cannot set cutting mode, provided object id not on map: ",
        polyline_id
      );
      return;
    }
    if (!cb) {
      console.error(
        "MAP: Cannot setCuttingMode without supplying completed callback."
      );
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
        position: default_center,
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
    this.cutting_completed_listener = value => {
      if (cb) {
        (cb as any)(value);
      } else {
        throw new Error("Callback for cutting completed not defined.");
      }
    };
  };
  const cuttingPositionUpdate = (mouse_event: GoogleMapsWrapper.MouseEvent) => {
    if (!this.cutting.enabled || !this.cutting.id) {
      //If we are not in cutting mode ignore this function call.
      return;
    }
    let polyline = this.map_objects.polyline[this.cutting.id];
    let mouse_coord = {
      lat: mouse_event.latLng.lat(),
      lng: mouse_event.latLng.lng()
    };
    let closest_index = 0;
    let closest_dist = Infinity;
    //Find nearest index and move scissors_hover marker.
    polyline.gmaps_obj.getPath().forEach((point, i: number) => {
      let dist = haversineDistance(mouse_coord, {
        lat: point.lat(),
        lng: point.lng()
      });
      if (dist < closest_dist) {
        closest_index = i;
        closest_dist = dist;
      }
    });
    let path = polyline.gmaps_obj.getPath().getArray();
    if (
      closest_dist < CUTTING_SNAP_DISTANCE &&
      closest_index > 0 &&
      closest_index < path.length - 1
    ) {
      this.cutting_objects.hover_scissors.gmaps_obj.setOptions({
        position: {
          lat: path[closest_index].lat(),
          lng: path[closest_index].lng()
        },
        visible: true
      });
    } else {
      this.cutting_objects.hover_scissors.gmaps_obj.setOptions({
        visible: false
      });
    }
  };
  const cuttingClick = (mouse_event: google.maps.MouseEvent) => {
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
    let mouse_coord = {
      lat: mouse_event.latLng.lat(),
      lng: mouse_event.latLng.lng()
    };
    let closest_index = 0;
    let closest_dist = In;
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
    let already_selected_position = this.cutting.indexes.findIndex(
      value => closest_index === value
    );
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
  };
  const completeCuttingMode = () => {
    if (!this.cutting || this.cutting.id === null) {
      return;
    }
    let indexes = this.cutting.indexes;
    let polyline = this.map_objects.polyline[this.cutting.id];
    if (!polyline) {
      return;
    }
    this.cutting = {
      enabled: false,
      id: null,
      indexes: null
    };
    Object.keys(this.cutting_objects).forEach(marker_id => {
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

    let path = (polyline.options.path as unknown) as [number, number][];
    indexes.sort();
    //Add last index so that the remaining points form a segment as well.
    indexes.push(path.length - 1);
    let resulting_segments: [number, number][][] = [];
    let prev_index = 0;
    indexes.forEach(index => {
      let segment = path.slice(prev_index, index);
      //Copy last point as well.
      segment.push(path[index]);
      resulting_segments.push(segment);
      prev_index = index;
    });
    if (this.cutting_completed_listener) {
      this.cutting_completed_listener(resulting_segments);
    }
  };
  const cancelCuttingMode = () => {
    this.cutting = {
      enabled: false,
      id: null,
      indexes: null
    };
    Object.keys(this.cutting_objects).forEach(marker_id => {
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
  };

  return (
    <div style={{ height: "100%" }}>
      <div
        ref="map"
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
