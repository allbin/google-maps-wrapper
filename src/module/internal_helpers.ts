/////////////////////////////////
//INTERNAL MAP HELPER FUNCTIONS
//These functions are not exported to enduser, only used
//internally by the map.

import WrappedMapBase from "./index";
import { GoogleMapsWrapper } from "google_maps_wrapper";
import LatLng = GoogleMapsWrapper.LatLng;
import LatLngBoundsLiteral = GoogleMapsWrapper.LatLngBoundsLiteral;
import LatLngLiteral = GoogleMapsWrapper.LatLngLiteral;
import PolylineOptionsSet = GoogleMapsWrapper.PolylineOptionsSet;
import WrappedPolyline = GoogleMapsWrapper.WrappedPolyline;
import PolygonOptionsSet = GoogleMapsWrapper.PolygonOptionsSet;
import WrappedPolygon = GoogleMapsWrapper.WrappedPolygon;
import MarkerOptionsSet = GoogleMapsWrapper.MarkerOptionsSet;
import WrappedMarker = GoogleMapsWrapper.WrappedMarker;
import MapObjectType = GoogleMapsWrapper.MapObjectType;
import AnyObjectOptionsSet = GoogleMapsWrapper.AnyObjectOptionsSet;
import PolylineOptions = GoogleMapsWrapper.PolylineOptions;
import PolygonOptions = GoogleMapsWrapper.PolygonOptions;
import MarkerOptions = GoogleMapsWrapper.MarkerOptions;
import WrappedGmapObj = GoogleMapsWrapper.WrappedGmapObj;
import AllMapObjEvents = GoogleMapsWrapper.AllMapObjEvents;
import WrappedFeature = GoogleMapsWrapper.WrappedFeature;

const DEFAULT_POLYLINE_OPTIONS = {
  visible: true
};
const DEFAULT_POLYGON_OPTIONS = {
  visible: true
};
const DEFAULT_MARKER_OPTIONS = {
  visible: true
};

export function fromLatLngToPixel(map_ref: WrappedMapBase, latLng: LatLng) {
  if (!map_ref.map) {
    throw new Error("Cannot call fromLatLngToPixel before init is finished.");
  }
  let map = map_ref.map;
  let bounds = map.getBounds();
  if (!bounds) {
    throw new Error("Map not mounted when calling fromLatLngToPixel");
  }
  const topRight = map.getProjection().fromLatLngToPoint(bounds.getNorthEast());
  const bottomLeft = map
    .getProjection()
    .fromLatLngToPoint(bounds.getSouthWest());
  const scale = Math.pow(2, map.getZoom());
  const worldPoint = map.getProjection().fromLatLngToPoint(latLng);
  return new window.google.maps.Point(
    (worldPoint.x - bottomLeft.x) * scale,
    (worldPoint.y - topRight.y) * scale
  );
}

export function fitToBoundsOfArray(
  map_ref: WrappedMapBase,
  arr_of_coords: [number, number][]
) {
  //Takes [[x, y], ...] array.
  return new Promise((resolve, reject) => {
    if (Array.isArray(arr_of_coords) === false) {
      reject("Input not valid array.");
    } else if (arr_of_coords.length < 1) {
      reject("Array needs to countain at least one element.");
    }
    if (!map_ref.initialized) {
      map_ref.do_after_init.push(() => {
        fitToBoundsOfArray(map_ref, arr_of_coords)
          .then(res => {
            resolve(res);
          })
          .catch(err => {
            reject(err);
          });
      });
      return;
    }
    let lat_lng_literal = {
      east: Number.MIN_SAFE_INTEGER,
      west: Number.MAX_SAFE_INTEGER,
      north: Number.MAX_SAFE_INTEGER,
      south: Number.MIN_SAFE_INTEGER
    };

    arr_of_coords.forEach(point => {
      lat_lng_literal.west =
        point[0] < lat_lng_literal.west ? point[0] : lat_lng_literal.west;
      lat_lng_literal.east =
        point[0] > lat_lng_literal.east ? point[0] : lat_lng_literal.east;
      lat_lng_literal.north =
        point[1] < lat_lng_literal.north ? point[1] : lat_lng_literal.north;
      lat_lng_literal.south =
        point[1] > lat_lng_literal.south ? point[1] : lat_lng_literal.south;
    });

    if (map_ref.map) {
      map_ref.map.fitBounds(lat_lng_literal);
    }
    resolve();
  });
}
export function fitToBoundsLiteral(
  map_ref: WrappedMapBase,
  bounds: LatLngBoundsLiteral
) {
  return new Promise((resolve, reject) => {
    if (!map_ref.initialized) {
      map_ref.do_after_init.push(() => {
        fitToBoundsLiteral(map_ref, bounds)
          .then(res => {
            resolve(res);
          })
          .catch(err => {
            reject(err);
          });
      });
      return;
    }

    if (map_ref.map) {
      map_ref.map.fitBounds(bounds);
    }
    resolve();
  });
}
export function fitToBoundsOfObjectArray(
  map_ref: WrappedMapBase,
  arr_of_latlngliteral: LatLngLiteral[]
) {
  //Takes [{ lat: ?, lng: ? }, ...] array.
  return new Promise((resolve, reject) => {
    if (Array.isArray(arr_of_latlngliteral) === false) {
      reject("Input not valid array.");
    } else if (arr_of_latlngliteral.length < 1) {
      reject("Array needs to countain at least one element.");
    }
    if (!map_ref.initialized) {
      map_ref.do_after_init.push(() => {
        fitToBoundsOfObjectArray(map_ref, arr_of_latlngliteral)
          .then(res => {
            resolve(res);
          })
          .catch(err => {
            reject(err);
          });
      });
      return;
    }
    let lat_lng_literal = {
      east: -Infinity,
      west: Infinity,
      north: Infinity,
      south: -Infinity
    };

    arr_of_latlngliteral.forEach(point => {
      lat_lng_literal.west =
        point.lng < lat_lng_literal.west ? point.lng : lat_lng_literal.west;
      lat_lng_literal.east =
        point.lng > lat_lng_literal.east ? point.lng : lat_lng_literal.east;
      lat_lng_literal.north =
        point.lat < lat_lng_literal.north ? point.lat : lat_lng_literal.north;
      lat_lng_literal.south =
        point.lat > lat_lng_literal.south ? point.lat : lat_lng_literal.south;
    });

    if (map_ref.map) {
      map_ref.map.fitBounds(lat_lng_literal);
    }
    resolve();
  });
}

export function setPolyline(
  map_ref: WrappedMapBase,
  id: string | number,
  options: PolylineOptionsSet
): Promise<WrappedPolyline> {
  return setMapObject(map_ref, "polyline", id, options) as Promise<
    WrappedPolyline
  >;
}
export function setPolygon(
  map_ref: WrappedMapBase,
  id: string | number,
  options: PolygonOptionsSet
): Promise<WrappedPolygon> {
  return setMapObject(map_ref, "polygon", id, options) as Promise<
    WrappedPolygon
  >;
}
export function setMarker(
  map_ref: WrappedMapBase,
  id: string | number,
  options: MarkerOptionsSet
): Promise<WrappedMarker> {
  return setMapObject(map_ref, "marker", id, options) as Promise<WrappedMarker>;
}

type setMapObject = (
  map_ref: WrappedMapBase,
  type: MapObjectType,
  id: string | number,
  options: AnyObjectOptionsSet,
  current_options_id?: string
) => Promise<WrappedPolyline | WrappedPolygon | WrappedMarker>;

export const setMapObject: setMapObject = (
  map_ref,
  type,
  id,
  options,
  selected_options_id = "default"
) => {
  return new Promise((resolve, reject) => {
    if (!map_ref.initialized) {
      map_ref.do_after_init.push(() => {
        setMapObject(map_ref, type, id, options, selected_options_id)
          .then(res => {
            resolve(res);
          })
          .catch(err => {
            reject(err);
          });
      });
      return;
    }

    if (map_ref.map_objects[type].hasOwnProperty(id)) {
      //This ID has already been drawn.
      let map_obj = map_ref.map_objects[type][id];
      const visible = map_obj.gmaps_obj.getVisible();
      let opts = Object.assign(
        {},
        map_obj.options[selected_options_id],
        options[selected_options_id],
        { visible: visible }
      );
      map_obj.selected_options_id = selected_options_id;
      switch (map_obj.type) {
        case "polyline": {
          map_obj.gmaps_obj.setOptions(opts as PolylineOptions);
          map_obj.options = options as PolylineOptionsSet;
          break;
        }
        case "polygon": {
          map_obj.gmaps_obj.setOptions(opts as PolygonOptions);
          map_obj.options = options as PolygonOptionsSet;
          break;
        }
        case "marker": {
          map_obj.gmaps_obj.setOptions(opts as MarkerOptions);
          map_obj.options = options as MarkerOptionsSet;
          break;
        }
        default: {
          reject(new Error("Invalid map object type."));
        }
      }
      resolve(map_obj);
      return;
    }

    //This extra interface exists so that _cbs can be created at different points in the following code.
    //Otherwise ungainly "hasOwnProperty"-like checks are required.
    interface MapObjShell extends Partial<WrappedGmapObj> {
      _cbs: {
        [key: string]: (e?: any) => void;
      };
      type: MapObjectType;
      selected_options_id: string;
    }

    let map_obj_shell: MapObjShell = {
      _cbs: {},
      type: type,
      selected_options_id: selected_options_id
    };
    let events: AllMapObjEvents[] = [];
    let path_events: AllMapObjEvents[] = [];
    switch (type) {
      case "marker": {
        let opts = Object.assign({}, DEFAULT_MARKER_OPTIONS, options.default);
        map_obj_shell.gmaps_obj = new window.google.maps.Marker(opts);
        map_obj_shell.options = options;
        events = [
          "click",
          "mouseover",
          "mouseout",
          "mousedown",
          "mouseup",
          "dragstart",
          "drag",
          "dragend",
          "dblclick",
          "rightclick"
        ];
        break;
      }
      case "polygon": {
        let opts = Object.assign({}, DEFAULT_POLYGON_OPTIONS, options.default);
        map_obj_shell.gmaps_obj = new window.google.maps.Polygon(opts);
        map_obj_shell.options = options;
        events = [
          "click",
          "dblclick",
          "dragstart",
          "drag",
          "dragend",
          "mouseover",
          "mouseout",
          "mousedown",
          "mouseup",
          "mousemove",
          "rightclick"
        ];
        path_events = ["set_at", "remove_at", "insert_at"];
        break;
      }
      case "polyline": {
        let opts = Object.assign({}, DEFAULT_POLYLINE_OPTIONS, options.default);
        map_obj_shell.gmaps_obj = new window.google.maps.Polyline(opts);
        map_obj_shell.options = options;
        events = [
          "click",
          "dblclick",
          "dragstart",
          "drag",
          "dragend",
          "mouseover",
          "mouseout",
          "mousedown",
          "mouseup",
          "mousemove",
          "rightclick"
        ];
        path_events = ["set_at", "remove_at", "insert_at"];
        break;
      }
      default: {
        reject(new Error("Invalid map object type."));
        return;
      }
    }

    map_obj_shell.registerEventCB = (event_type: string, cb) => {
      map_obj_shell._cbs[event_type] = cb;
    };
    map_obj_shell.unregisterEventCB = event_type => {
      if (map_obj_shell._cbs.hasOwnProperty(event_type)) {
        delete map_obj_shell._cbs[event_type];
      }
    };

    map_obj_shell.remove = () => {
      return unsetMapObject(map_ref, type, id);
    };
    map_obj_shell.setOptions = new_options => {
      return setMapObject(
        map_ref,
        type,
        id,
        new_options,
        map_obj_shell.selected_options_id
      );
    };
    map_obj_shell.applyOptions = options_id => {
      if (!options.hasOwnProperty(options_id)) {
        throw new Error(
          "Tried to applyOptions(options_id) with '" +
            options_id +
            "', but options for given id are not defined."
        );
      }
      map_obj_shell.selected_options_id = options_id;
      const visible = (map_obj_shell.gmaps_obj as google.maps.Polygon).getVisible();
      const opts_set = map_obj_shell.options;
      map_obj_shell.gmaps_obj.setOptions(
        Object.assign({}, opts_set.default, opts_set[options_id], {
          visible: visible
        })
      );
    };
    map_obj_shell.hide = () => {
      map_obj_shell.gmaps_obj.setOptions(
        Object.assign(
          {},
          map_obj_shell.options[map_obj_shell.selected_options_id],
          { visible: false }
        )
      );
    };
    map_obj_shell.show = () => {
      map_obj_shell.gmaps_obj.setOptions(
        Object.assign(
          {},
          map_obj_shell.options[map_obj_shell.selected_options_id],
          { visible: true }
        )
      );
    };
    let map_obj = map_obj_shell as WrappedGmapObj;
    events.forEach(event_type => {
      map_obj.gmaps_obj.addListener(event_type, (e: any) => {
        return mapObjectEventCB(map_ref, map_obj, event_type, e);
      });
    });
    path_events.forEach(event_type => {
      map_obj.gmaps_obj.getPath().addListener(event_type, (e: any) => {
        return mapObjectEventCB(map_ref, map_obj, event_type, e);
      });
    });

    map_obj.gmaps_obj.setMap(map_ref.map);

    switch (map_obj.type) {
      case "polyline": {
        map_obj.zoomTo = () => {
          panZoomToObjectOrFeature(map_ref, map_obj as WrappedPolyline, true);
        };
        map_obj.panTo = () => {
          panZoomToObjectOrFeature(map_ref, map_obj as WrappedPolyline, false);
        };
        map_ref.map_objects[type][id] = map_obj as WrappedPolyline;
        resolve(map_obj as WrappedPolyline);
        break;
      }
      case "polygon": {
        map_obj.zoomTo = () => {
          panZoomToObjectOrFeature(map_ref, map_obj as WrappedPolygon, true);
        };
        map_obj.panTo = () => {
          panZoomToObjectOrFeature(map_ref, map_obj as WrappedPolygon, false);
        };
        map_ref.map_objects[type][id] = map_obj as WrappedPolygon;
        resolve(map_obj as WrappedPolygon);
        break;
      }
      case "marker": {
        map_obj.zoomTo = () => {
          panZoomToObjectOrFeature(map_ref, map_obj as WrappedMarker, true);
        };
        map_obj.panTo = () => {
          panZoomToObjectOrFeature(map_ref, map_obj as WrappedMarker, false);
        };
        map_ref.map_objects[type][id] = map_obj as WrappedMarker;
        resolve(map_obj as WrappedMarker);
        break;
      }
      default: {
        reject(new Error("Invalid map object type."));
      }
    }
    return;
  });
};

export function unsetMapObject(
  map_ref: WrappedMapBase,
  type: MapObjectType,
  id: string | number
) {
  return new Promise<boolean>((resolve, reject) => {
    if (!map_ref.initialized) {
      map_ref.do_after_init.push(() => {
        unsetMapObject(map_ref, type, id)
          .then(res => {
            resolve(res);
          })
          .catch(err => {
            reject(err);
          });
      });
      return;
    }

    if (map_ref.map_objects[type].hasOwnProperty(id)) {
      //This ID has been drawn.

      if (map_ref.cutting.id && map_ref.cutting.id !== id) {
        //This object is currently being cut, it cannot be deleted.
        reject(
          new Error(
            "MAP: Object is currently in cuttingMode; it cannot be removed!"
          )
        );
        return;
      }

      map_ref.map_objects[type][id].gmaps_obj.setMap(null);
      delete map_ref.map_objects[type][id];
      resolve(true);
      return;
    }
    reject(new Error("MAP: MapObject does not exist."));
  });
}

export function mapObjectEventCB(
  map_ref: WrappedMapBase,
  map_obj: WrappedGmapObj,
  event_type: AllMapObjEvents,
  e: any
) {
  if (map_ref.cutting.enabled) {
    //When the map is in cutting mode no object event callbacks are allowed.
    return true;
  }

  if (map_obj._cbs.hasOwnProperty(event_type) && map_obj._cbs[event_type]) {
    map_obj._cbs[event_type](e);
  }
  return true;
}

export function panZoomToObjectOrFeature(
  map_ref: WrappedMapBase,
  obj: WrappedMarker | WrappedPolygon | WrappedPolyline | WrappedFeature,
  zoom: boolean = true
) {
  if (!map_ref.map) {
    return;
  }
  if (obj.hasOwnProperty("gmaps_feature")) {
    if (zoom) {
      map_ref.map.fitBounds((obj as WrappedFeature)._bbox);
    } else {
      map_ref.map.panToBounds((obj as WrappedFeature)._bbox);
    }
    return;
  }

  obj = obj as WrappedMarker | WrappedPolygon | WrappedPolyline; //Reset typing.
  switch (obj.type) {
    case "marker": {
      let position = obj.gmaps_obj.getPosition();
      map_ref.map.setCenter(position);
      if (zoom) {
        map_ref.map.setZoom(14);
      }
      break;
    }
    case "polyline": {
      let bounds = {
        north: -Infinity,
        south: Infinity,
        west: Infinity,
        east: -Infinity
      };
      obj.gmaps_obj.getPath().forEach(point => {
        bounds.north = point.lat() > bounds.north ? point.lat() : bounds.north;
        bounds.south = point.lat() < bounds.south ? point.lat() : bounds.south;
        bounds.west = point.lng() < bounds.west ? point.lng() : bounds.west;
        bounds.east = point.lng() > bounds.east ? point.lng() : bounds.east;
      });
      if (zoom) {
        map_ref.map.fitBounds(bounds);
      } else {
        map_ref.map.panToBounds(bounds);
      }
      break;
    }
    case "polygon": {
      let bounds = {
        north: -Infinity,
        south: Infinity,
        west: Infinity,
        east: -Infinity
      };
      obj.gmaps_obj.getPaths().forEach(path => {
        path.forEach(point => {
          bounds.north =
            point.lat() > bounds.north ? point.lat() : bounds.north;
          bounds.south =
            point.lat() < bounds.south ? point.lat() : bounds.south;
          bounds.west = point.lng() < bounds.west ? point.lng() : bounds.west;
          bounds.east = point.lng() > bounds.east ? point.lng() : bounds.east;
        });
      });
      if (zoom) {
        map_ref.map.fitBounds(bounds);
      } else {
        map_ref.map.panToBounds(bounds);
      }
      break;
    }
  }
}
