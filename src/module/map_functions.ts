import * as internal_helpers from "./internal_helpers";
import { haversineDistance, MVCArrayToCoordArray } from "./external_helpers";
import {
  CUTTING_SNAP_DISTANCE,
  Z_INDEX_SCISSORS,
  Z_INDEX_SCISSORS_HOVER
} from "./constants";
let ScissorIcon = require("./img/marker_scissors.svg");
let ScissorHoverIcon = require("./img/marker_scissors_hover.svg");

export const getBoundsLiteral = (map: google.maps.Map | undefined) => {
  if (!map) {
    return null;
  }
  const bounds = map.getBounds();
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

/*** Takes a coordinate and center it on the map  */
export const setCenter = (
  map: google.maps.Map | undefined,
  lat_lng: LatLngLiteral | LatLng
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (map) {
      map.setCenter(lat_lng);
    }
    resolve();
    return;
  });
};

export const toPixel = (
  lat_lng_input: LatLng | LatLngLiteral,
  html_element: any,
  overlay: google.maps.OverlayView | undefined
): [number, number] => {
  if (!overlay) {
    throw new Error("Overlay not loaded when calling toPixel.");
  }
  let node_rect = html_element.getBoundingClientRect();
  let lat_lng: LatLng;
  if (lat_lng_input instanceof google.maps.LatLng) {
    lat_lng = lat_lng_input;
  } else {
    lat_lng = new window.google.maps.LatLng(lat_lng_input);
  }
  let pixel_obj = overlay.getProjection().fromLatLngToContainerPixel(lat_lng);
  return [pixel_obj.x + node_rect.left, pixel_obj.y + node_rect.top];
};

export const setZoom = (
  zoom_level: number,
  map: google.maps.Map | undefined
): Promise<void> =>
  new Promise((resolve, reject) => {
    map && map.setZoom(zoom_level);
    resolve();
    return;
  });

export const clearPolylines = (
  map_objects: MapObjects,
  cutting: CuttingState
): Promise<boolean[]> => {
  let promise_arr: Promise<boolean>[] = [];
  Object.keys(map_objects.polyline).forEach(id => {
    promise_arr.push(
      internal_helpers.unsetMapObject(map_objects, cutting, "polyline", id)
    );
  });
  return Promise.all(promise_arr);
};

export const clearPolygons = (
  map_objects: MapObjects,
  cutting: CuttingState
): Promise<boolean[]> =>
  Promise.all(
    Object.keys(map_objects.polygon).map(id =>
      internal_helpers.unsetMapObject(map_objects, cutting, "polygon", id)
    )
  );

export const setMarker = (
  map: google.maps.Map,
  map_objects: MapObjects,
  cutting: CuttingState,
  id: string | number,
  options: MarkerOptionsSet
): Promise<WrappedMarker> =>
  internal_helpers.setMarker(map, map_objects, cutting, id, options);
export const clearMarkers = (
  map_objects: MapObjects,
  cutting: CuttingState
): Promise<boolean[]> =>
  Promise.all(
    Object.keys(map_objects.marker).map(id =>
      internal_helpers.unsetMapObject(map_objects, cutting, "marker", id)
    )
  );
export const clearFeatureCollections = (
  map_objects: MapObjects,
  features_layer: google.maps.Data,
  feature_layers: google.maps.Data[]
) => {
  feature_layers.forEach(x => x.setMap(null));
  feature_layers = [];
  if (features_layer) {
    Object.keys(map_objects.features).forEach(feature_key => {
      map_objects.features[feature_key].remove();
    });
  }
};

export const setDrawingMode = (
  services: any,
  type: "polyline" | "polygon",
  opts: PolylineOptions | PolygonOptions,
  cb: DrawingCB,
  cancel_drawing: boolean,
  drawing_completed_listener: google.maps.MapsEventListener
) => {
  let mode = null;
  if (!services.drawing) {
    console.error(
      "MAP: Drawing library not available! Add it to google maps api request url."
    );
    return;
  }
  if (services.drawing.OverlayType.hasOwnProperty(type.toUpperCase())) {
    mode = services.drawing.OverlayType[type.toUpperCase()];
  } else {
    throw new Error("MAP: Invalid drawing mode type:" + type);
  }
  let drawing_opts = Object.assign({}, opts, { drawingMode: mode });
  services.drawingManager.setOptions(drawing_opts);
  console.log("MAP: Drawing mode started for:", type + ".");
  cancel_drawing = false;

  if (drawing_completed_listener) {
    drawing_completed_listener.remove();
  }
  drawing_completed_listener = google.maps.event.addListenerOnce(
    services.drawingManager,
    "overlaycomplete",
    (e: google.maps.drawing.OverlayCompleteEvent) => {
      // console.log("overlay complete", cb, cancel_drawing);
      e.overlay.setMap(null);
      drawing_opts.drawingMode = null;
      services.drawingManager.setOptions(drawing_opts);
      if (!cb || cancel_drawing) {
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
      // cancel_drawing = false;
      // drawing_completed_listener = null;
    }
  );
};
export const completeDrawingMode = (
  services: any,
  drawing_completed_listener: google.maps.MapsEventListener
) => {
  if (services.drawing) {
    services.drawingManager.setOptions({ drawingMode: null });
  }
  if (drawing_completed_listener) {
    drawing_completed_listener.remove();
    // drawing_completed_listener = null;
  }
};
export const cancelDrawingMode = (
  services: any,
  cancel_drawing: boolean,
  drawing_completed_listener: google.maps.MapsEventListener,
  debug_src?: string
) => {
  if (debug_src) {
    console.log("cancel drawing mode:", debug_src);
  }
  if (services.drawing && drawing_completed_listener) {
    cancel_drawing = true;
    services.drawingManager.setOptions({ drawingMode: null });
  }
};

export const setCuttingMode = (
  services: any,
  map: google.maps.Map,
  map_objects: MapObjects,
  cutting: CuttingState,
  cutting_objects: CuttingObjects,
  default_center: LatLngLiteral,
  cancel_drawing: boolean,
  drawing_completed_listener: google.maps.MapsEventListener,
  polyline_id: string | number,
  cutting_completed_listener: (segments: [number, number][][] | null) => void,
  cb?: () => any
) => {
  if (!map_objects.polyline.hasOwnProperty(polyline_id)) {
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
  cancelDrawingMode(
    services,
    cancel_drawing,
    drawing_completed_listener,
    "setCuttingMode"
  );
  let polyline = map_objects.polyline[polyline_id];
  let opts = {
    clickable: false,
    editable: false
  };
  polyline.gmaps_obj.setOptions(opts);

  const path = polyline.options.path;
  cutting = {
    enabled: true,
    id: polyline_id,
    indexes: [],
    arr: path as any
  };
  if (!cutting_objects.hasOwnProperty("hover_scissors")) {
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
    hover_scissors.gmaps_obj.setMap(map);
    cutting_objects.hover_scissors = hover_scissors;
  }
  console.log("MAP: Cutting mode started for id: " + polyline_id);
  cutting_completed_listener = value => {
    if (cb) {
      (cb as any)(value);
    } else {
      throw new Error("Callback for cutting completed not defined.");
    }
  };
};
export const cuttingPositionUpdate = (
  mouse_event: MouseEvent,
  map_objects: MapObjects,
  cutting: CuttingState,
  cutting_objects: CuttingObjects
) => {
  if (!cutting.enabled || !cutting.id) {
    //If we are not in cutting mode ignore function call.
    return;
  }
  let polyline = map_objects.polyline[cutting.id];
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
    cutting_objects.hover_scissors.gmaps_obj.setOptions({
      position: {
        lat: path[closest_index].lat(),
        lng: path[closest_index].lng()
      },
      visible: true
    });
  } else {
    cutting_objects.hover_scissors.gmaps_obj.setOptions({
      visible: false
    });
  }
};
export const cuttingClick = (
  mouse_event: google.maps.MouseEvent,
  map: google.maps.Map,
  map_objects: MapObjects,
  cutting: CuttingState,
  cutting_objects: CuttingObjects
): void => {
  if (!cutting.id) {
    console.error("No cutting.id set when clicking for cut.");
    return;
  }
  if (!cutting.indexes) {
    console.error("cutting.indexes not defined when clicking for cut.");
    return;
  }
  let polyline = map_objects.polyline[cutting.id];
  let path = polyline.options.path as any;
  let mouse_coord = {
    lat: mouse_event.latLng.lat(),
    lng: mouse_event.latLng.lng()
  };
  let closest_index = 0;
  let closest_dist = Infinity;
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
  let already_selected_position = cutting.indexes.findIndex(
    value => closest_index === value
  );
  if (already_selected_position > -1) {
    //This index has already been selected for cutting, remove it.
    cutting.indexes.splice(already_selected_position, 1);
    if (cutting_objects.hasOwnProperty("index_" + closest_index)) {
      //We have drawn a marker for cut, remove it.
      cutting_objects["index_" + closest_index].gmaps_obj.setMap(null);
      delete cutting_objects["index_" + closest_index];
    }
  } else {
    cutting.indexes.push(closest_index);
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
    cut_marker.gmaps_obj.setMap(map);
    cutting_objects["index_" + closest_index] = cut_marker;
  }
};
export const completeCuttingMode = (
  map_objects: MapObjects,
  cutting: CuttingState,
  cutting_objects: CuttingObjects,
  cutting_completed_listener: (segments: [number, number][][] | null) => void
) => {
  if (!cutting || cutting.id === null) {
    return;
  }
  let indexes = cutting.indexes;
  let polyline = map_objects.polyline[cutting.id];
  if (!polyline) {
    return;
  }
  // TODO do not reassign inside function
  cutting = {
    enabled: false,
    id: null,
    indexes: null
  };
  Object.keys(cutting_objects).forEach(marker_id => {
    //Remove all cutting related markers.
    cutting_objects[marker_id].gmaps_obj.setMap(null);
    delete cutting_objects[marker_id];
  });

  let opts = {
    clickable: true,
    editable: true
  };
  polyline.gmaps_obj.setOptions(opts);
  if (!indexes || indexes.length === 0) {
    //We made no selections, just return.
    if (cutting_completed_listener) {
      cutting_completed_listener(null);
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
  if (cutting_completed_listener) {
    cutting_completed_listener(resulting_segments);
  }
};
export const cancelCuttingMode = (
  map_objects: MapObjects,
  cutting: CuttingState,
  cutting_objects: CuttingObjects
) => {
  //TODO no reassign of prameter
  cutting = {
    enabled: false,
    id: null,
    indexes: null
  };
  Object.keys(cutting_objects).forEach(marker_id => {
    //Remove all cutting related markers.
    cutting_objects[marker_id].gmaps_obj.setMap(null);
    delete cutting_objects[marker_id];
  });
  if (!cutting.id) {
    console.error("No cutting.id set when cancelling cutting mode.");
    return;
  }
  let polyline = map_objects.polyline[cutting.id];
  if (polyline) {
    let opts = {
      clickable: true,
      editable: true
    };
    polyline.gmaps_obj.setOptions(opts);
  }
};
