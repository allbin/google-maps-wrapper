import * as internal_helpers from "./internal_helpers";
import { haversineDistance, MVCArrayToCoordArray } from "./external_helpers";
import {
  CUTTING_SNAP_DISTANCE,
  Z_INDEX_SCISSORS,
  Z_INDEX_SCISSORS_HOVER,
} from "./constants";
import ScissorIcon from "./img/marker_scissors.svg";
import ScissorHoverIcon from "./img/marker_scissors_hover.svg";
import {
  GMW_LatLngLiteral,
  GMW_LatLng,
  GMW_MarkerOptionsSet,
  GMW_PolylineOptions,
  GMW_PolygonOptions,
  GMW_Polygon,
  GMW_Polyline,
  GMW_Marker,
  GMW_WrappedMarker,
  GMW_DrawingCB,
  GMW_Services,
  GMW_LatLngBoundsLiteral,
  GMW_LatLngBounds,
} from ".";
import { MapObjects, CuttingState, CuttingObjects } from "./WrappedMapBase";

interface DrawingListenerObject {
  listener?: google.maps.MapsEventListener;
  cancel: boolean;
}
interface CuttingListenerObject {
  listener?: (segments: [number, number][][] | null) => void;
  cancel: boolean;
}

export const getBoundsLiteral = (
  map: google.maps.Map | undefined
): undefined | { north: number; east: number; south: number; west: number } => {
  if (!map) {
    return undefined;
  }
  const bounds = map.getBounds();
  if (!bounds) {
    return undefined;
  }
  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();
  return {
    north: ne.lat(),
    east: ne.lng(),
    south: sw.lat(),
    west: sw.lng(),
  };
};
export const getBounds = (
  map: google.maps.Map | undefined
): undefined | GMW_LatLngBounds => {
  if (!map) {
    return undefined;
  }
  const bounds = map.getBounds();
  if (!bounds) {
    return undefined;
  }
  return bounds;
};

/** Takes a coordinate and center it on the map  */
export const setCenter = (
  map: google.maps.Map | undefined,
  lat_lng: GMW_LatLngLiteral | GMW_LatLng
): Promise<void> => {
  return new Promise((resolve) => {
    if (map) {
      map.setCenter(lat_lng);
    }
    resolve();
    return;
  });
};

export const setBounds = (
  map: google.maps.Map | undefined,
  bounds: GMW_LatLngBoundsLiteral | GMW_LatLngBounds
): Promise<void> => {
  return new Promise((resolve) => {
    if (map) {
      map.fitBounds(bounds);
    }
    return resolve();
  });
};

export const toPixel = (
  lat_lng_input: GMW_LatLng | GMW_LatLngLiteral,
  html_element: any,
  overlay: google.maps.OverlayView | undefined
): [number, number] => {
  if (!overlay) {
    throw new Error("Overlay not loaded when calling toPixel.");
  }
  const node_rect = html_element.getBoundingClientRect();
  let lat_lng: GMW_LatLng;
  if (lat_lng_input instanceof google.maps.LatLng) {
    lat_lng = lat_lng_input;
  } else {
    lat_lng = new window.google.maps.LatLng(lat_lng_input);
  }
  const pixel_obj = overlay.getProjection().fromLatLngToContainerPixel(lat_lng);
  return [pixel_obj.x + node_rect.left, pixel_obj.y + node_rect.top];
};

export const setZoom = (
  zoom_level: number,
  map: google.maps.Map | undefined
): Promise<void> =>
  new Promise((resolve) => {
    map && map.setZoom(zoom_level);
    resolve();
    return;
  });

export const clearPolylines = (
  verbose: boolean,
  map_objects: MapObjects,
  cutting: CuttingState
): Promise<boolean[]> => {
  const promise_arr: Promise<boolean>[] = [];
  Object.keys(map_objects.polyline).forEach((id) => {
    promise_arr.push(
      internal_helpers.unsetMapObject(
        verbose,
        map_objects,
        cutting,
        "polyline",
        id
      )
    );
  });
  return Promise.all(promise_arr);
};

export const clearPolygons = (
  verbose: boolean,
  map_objects: MapObjects,
  cutting: CuttingState
): Promise<boolean[]> =>
  Promise.all(
    Object.keys(map_objects.polygon).map((id) =>
      internal_helpers.unsetMapObject(
        verbose,
        map_objects,
        cutting,
        "polygon",
        id
      )
    )
  );

export const setMarker = (
  verbose: boolean,
  map: google.maps.Map,
  map_objects: MapObjects,
  cutting: CuttingState,
  id: string | number,
  options: GMW_MarkerOptionsSet
): Promise<GMW_WrappedMarker> =>
  internal_helpers.setMarker(verbose, map, map_objects, cutting, id, options);

export const clearMarkers = (
  verbose: boolean,
  map_objects: MapObjects,
  cutting: CuttingState
): Promise<boolean[]> =>
  Promise.all(
    Object.keys(map_objects.marker).map((id) =>
      internal_helpers.unsetMapObject(
        verbose,
        map_objects,
        cutting,
        "marker",
        id
      )
    )
  );
export const clearFeatureCollections = (
  map_objects: MapObjects,
  features_layer: google.maps.Data,
  feature_layers: google.maps.Data[]
): void => {
  feature_layers.forEach((x) => x.setMap(null));
  // feature_layers = [];
  if (features_layer) {
    Object.keys(map_objects.features).forEach((feature_key) => {
      map_objects.features[feature_key].remove();
    });
  }
};

export const setDrawingMode = (
  services: GMW_Services,
  type: "polyline" | "polygon",
  opts: GMW_PolylineOptions | GMW_PolygonOptions,
  cb: GMW_DrawingCB,
  drawing_completed_listener: DrawingListenerObject
): void => {
  let mode = null;
  if (!services.drawing) {
    console.error(
      "MAP: Drawing library not available! Add it to google maps api request url."
    );
    return;
  }
  if (
    Object.prototype.hasOwnProperty.call(
      services.drawing.OverlayType,
      type.toUpperCase()
    )
  ) {
    mode = services.drawing.OverlayType[type.toUpperCase()];
  } else {
    throw new Error("MAP: Invalid drawing mode type:" + type);
  }
  const drawing_opts = Object.assign(
    {},
    { drawingMode: mode, polylineOptions: opts, polygonOptions: opts }
  );
  services.drawingManager.setOptions(drawing_opts);
  console.log("MAP: Drawing mode started for:", type + ".");

  if (drawing_completed_listener.listener) {
    drawing_completed_listener.listener.remove();
  }
  drawing_completed_listener.listener = google.maps.event.addListenerOnce(
    services.drawingManager,
    "overlaycomplete",
    (e: google.maps.drawing.OverlayCompleteEvent) => {
      // console.log("overlay complete", cb, cancel_drawing);
      e.overlay.setMap(null);
      drawing_opts.drawingMode = null;
      services.drawingManager.setOptions(drawing_opts);
      if (!cb || drawing_completed_listener.cancel) {
        drawing_completed_listener.cancel = false;
        return;
      }
      if (type === "polyline" || type === "polygon") {
        const overlay = e.overlay as GMW_Polygon | GMW_Polyline;
        const path = MVCArrayToCoordArray(overlay.getPath());
        if (cb) {
          cb(path as [number, number][], overlay);
        }
      } else if (type === "marker") {
        const overlay = e.overlay as GMW_Marker;
        const pos = overlay.getPosition();
        cb([pos.lat(), pos.lng()], overlay);
      } else {
        cb(null, e.overlay as any);
      }
    }
  );
};

export const endDrawingMode = (
  services: GMW_Services,
  drawing_completed_listener: DrawingListenerObject,
  cancel: boolean,
  debug_src?: string
): void => {
  if (debug_src) {
    console.log("endDrawingMode debug src:", debug_src);
  }
  drawing_completed_listener.cancel = cancel;
  if (services.drawing) {
    services.drawingManager.setOptions({ drawingMode: null });
  }
  if (drawing_completed_listener.listener) {
    drawing_completed_listener.listener.remove();
    delete drawing_completed_listener.listener;
  }
};

export const setCuttingMode = (
  services: GMW_Services,
  map: google.maps.Map,
  map_objects: MapObjects,
  cutting: CuttingState,
  cutting_objects: CuttingObjects,
  default_center: GMW_LatLngLiteral,
  drawing_completed_listener: DrawingListenerObject,
  polyline_id: string | number,
  cutting_completed_listener: CuttingListenerObject,
  cb?: (segments: [number, number][][] | null) => void
): void => {
  if (
    !Object.prototype.hasOwnProperty.call(map_objects.polyline, polyline_id)
  ) {
    console.error(
      "MAP: Cannot set cutting mode, provided object id not on map: ",
      polyline_id
    );
    return;
  }
  // if (!cb) {
  //   console.error(
  //     "MAP: Cannot setCuttingMode without supplying completed callback."
  //   );
  //   return;
  // }
  endDrawingMode(services, drawing_completed_listener, true, "setCuttingMode");
  const polyline = map_objects.polyline[polyline_id];
  const opts = {
    clickable: false,
    editable: false,
  };
  polyline.gmaps_obj.setOptions(opts);

  const path = polyline.options.default.path;
  cutting.enabled = true;
  cutting.id = polyline_id;
  cutting.indexes = [];
  cutting.arr = path as any;
  if (!Object.hasOwnProperty.call(cutting_objects, "hover_scissors")) {
    const opts = {
      position: default_center,
      icon: {
        url: ScissorHoverIcon,
      },
      zIndex: Z_INDEX_SCISSORS_HOVER,
      visible: false,
      clickable: false,
      editable: false,
      draggable: false,
    };
    const hover_scissors = {
      gmaps_obj: new window.google.maps.Marker(opts),
      options: opts,
    };
    hover_scissors.gmaps_obj.setMap(map);
    cutting_objects.hover_scissors = hover_scissors;
  }
  console.log("MAP: Cutting mode started for id: " + polyline_id);
  cutting_completed_listener.listener = (value) => {
    if (cb) {
      (cb as any)(value);
    }
  };
};
export const cuttingPositionUpdate = (
  mouse_event: google.maps.MouseEvent,
  map_objects: MapObjects,
  cutting: CuttingState,
  cutting_objects: CuttingObjects
): void => {
  if (!cutting.enabled || !cutting.id) {
    //If we are not in cutting mode ignore function call.
    return;
  }
  const polyline = map_objects.polyline[cutting.id];
  const mouse_coord = {
    lat: mouse_event.latLng.lat(),
    lng: mouse_event.latLng.lng(),
  };
  let closest_index = 0;
  let closest_dist = Infinity;
  //Find nearest index and move scissors_hover marker.
  polyline.gmaps_obj.getPath().forEach((point, i: number) => {
    const dist = haversineDistance(mouse_coord, {
      lat: point.lat(),
      lng: point.lng(),
    });
    if (dist < closest_dist) {
      closest_index = i;
      closest_dist = dist;
    }
  });
  const path = polyline.gmaps_obj.getPath().getArray();
  if (
    closest_dist < CUTTING_SNAP_DISTANCE &&
    closest_index > 0 &&
    closest_index < path.length - 1
  ) {
    cutting_objects.hover_scissors.gmaps_obj.setOptions({
      position: {
        lat: path[closest_index].lat(),
        lng: path[closest_index].lng(),
      },
      visible: true,
    });
  } else {
    cutting_objects.hover_scissors.gmaps_obj.setOptions({
      visible: false,
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
  if (!cutting.arr || cutting.arr.length < 2) {
    console.error(
      "cutting.path not defined when clicking for cut. Cutting:",
      cutting
    );
    return;
  }
  // const polyline = map_objects.polyline[cutting.id];
  // const path = polyline.options.path as any;
  const mouse_coord = {
    lat: mouse_event.latLng.lat(),
    lng: mouse_event.latLng.lng(),
  };
  let closest_index = 0;
  let closest_dist = Infinity;
  cutting.arr.forEach((point: any, i: number) => {
    const dist = haversineDistance(mouse_coord, point);
    if (dist < closest_dist) {
      closest_index = i;
      closest_dist = dist;
    }
  });
  if (closest_dist > CUTTING_SNAP_DISTANCE) {
    //Pointer is too far away from any point, ignore.
    return;
  }
  if (closest_index === 0 || closest_index === cutting.arr.length - 1) {
    //We are never interested in first or last point.
    return;
  }
  const already_selected_position = cutting.indexes.findIndex(
    (value) => closest_index === value
  );
  if (already_selected_position > -1) {
    //This index has already been selected for cutting, remove it.
    cutting.indexes.splice(already_selected_position, 1);
    if (
      Object.prototype.hasOwnProperty.call(
        cutting_objects,
        "index_" + closest_index
      )
    ) {
      //We have drawn a marker for cut, remove it.
      cutting_objects["index_" + closest_index].gmaps_obj.setMap(null);
      delete cutting_objects["index_" + closest_index];
    }
  } else {
    cutting.indexes.push(closest_index);
    const opts = {
      position: cutting.arr[closest_index],
      icon: {
        url: ScissorIcon,
      },
      zIndex: Z_INDEX_SCISSORS,
      visible: true,
      clickable: false,
      editable: false,
      draggable: false,
    };
    const cut_marker = {
      gmaps_obj: new window.google.maps.Marker(opts),
      options: opts,
    };
    cut_marker.gmaps_obj.setMap(map);
    cutting_objects["index_" + closest_index] = cut_marker;
  }
};
export const completeCuttingMode = (
  map_objects: MapObjects,
  cutting: CuttingState,
  cutting_objects: CuttingObjects,
  cutting_completed_listener: CuttingListenerObject
): [number, number][][] => {
  if (!cutting || cutting.id === null) {
    return [];
  }
  const indexes = cutting.indexes;
  const polyline = map_objects.polyline[cutting.id];
  if (!polyline) {
    return [];
  }
  cutting.enabled = false;
  cutting.id = null;
  cutting.indexes = null;
  Object.keys(cutting_objects).forEach((marker_id) => {
    //Remove all cutting related markers.
    cutting_objects[marker_id].gmaps_obj.setMap(null);
    delete cutting_objects[marker_id];
  });

  if (!indexes || indexes.length === 0) {
    //We made no selections, just return.
    if (cutting_completed_listener.listener) {
      cutting_completed_listener.listener(null);
    }
    return [];
  }

  const path = cutting.arr;
  indexes.sort();
  //Add last index so that the remaining points form a segment as well.
  indexes.push(path.length - 1);
  const resulting_segments: [number, number][][] = [];
  let prev_index = 0;
  indexes.forEach((index) => {
    const segment = path.slice(prev_index, index);
    //Copy last point as well.
    segment.push(path[index]);
    resulting_segments.push(segment);
    prev_index = index;
  });
  if (cutting_completed_listener.listener) {
    cutting_completed_listener.listener(resulting_segments);
  }
  return resulting_segments;
};
export const cancelCuttingMode = (
  map_objects: MapObjects,
  cutting: CuttingState,
  cutting_objects: CuttingObjects
): void => {
  //TODO no reassign of prameter
  cutting.enabled = false;
  cutting.id = null;
  cutting.indexes = null;
  Object.keys(cutting_objects).forEach((marker_id) => {
    //Remove all cutting related markers.
    cutting_objects[marker_id].gmaps_obj.setMap(null);
    delete cutting_objects[marker_id];
  });
  if (!cutting.id) {
    console.error("No cutting.id set when cancelling cutting mode.");
    return;
  }
  const polyline = map_objects.polyline[cutting.id];
  if (polyline) {
    const opts = {
      clickable: true,
      editable: true,
    };
    polyline.gmaps_obj.setOptions(opts);
  }
};
