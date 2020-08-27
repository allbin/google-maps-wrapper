/////////////////////////////////
//INTERNAL MAP HELPER FUNCTIONS
//These functions are not exported to enduser, only used
//internally by the map.
const DEFAULT_POLYLINE_OPTIONS = {
    visible: true,
};
const DEFAULT_POLYGON_OPTIONS = {
    visible: true,
};
const DEFAULT_MARKER_OPTIONS = {
    visible: true,
};
export const fromLatLngToPixel = (map, latLng) => {
    if (!map) {
        throw new Error("Cannot call fromLatLngToPixel before init is finished.");
    }
    const bounds = map.getBounds();
    if (!bounds) {
        throw new Error("Map not mounted when calling fromLatLngToPixel");
    }
    const topRight = map.getProjection().fromLatLngToPoint(bounds.getNorthEast());
    const bottomLeft = map
        .getProjection()
        .fromLatLngToPoint(bounds.getSouthWest());
    const scale = Math.pow(2, map.getZoom());
    const worldPoint = map.getProjection().fromLatLngToPoint(latLng);
    return new window.google.maps.Point((worldPoint.x - bottomLeft.x) * scale, (worldPoint.y - topRight.y) * scale);
};
export const fitToBoundsOfArray = (map, arr_of_coords) => new Promise((resolve, reject) => {
    if (Array.isArray(arr_of_coords) === false) {
        reject("Input not valid array.");
    }
    else if (arr_of_coords.length < 1) {
        reject("Array needs to countain at least one element.");
    }
    const lat_lng_literal = {
        east: Number.MIN_SAFE_INTEGER,
        west: Number.MAX_SAFE_INTEGER,
        north: Number.MAX_SAFE_INTEGER,
        south: Number.MIN_SAFE_INTEGER,
    };
    arr_of_coords.forEach((point) => {
        lat_lng_literal.west =
            point[0] < lat_lng_literal.west ? point[0] : lat_lng_literal.west;
        lat_lng_literal.east =
            point[0] > lat_lng_literal.east ? point[0] : lat_lng_literal.east;
        lat_lng_literal.north =
            point[1] < lat_lng_literal.north ? point[1] : lat_lng_literal.north;
        lat_lng_literal.south =
            point[1] > lat_lng_literal.south ? point[1] : lat_lng_literal.south;
    });
    if (map) {
        map.fitBounds(lat_lng_literal);
    }
    resolve();
});
export const fitToBoundsLiteral = (bounds, map) => new Promise((resolve) => {
    if (map) {
        map.fitBounds(bounds);
    }
    resolve();
});
export const fitToBoundsOfObjectArray = (arr_of_latlngliteral, map) => new Promise((resolve, reject) => {
    if (Array.isArray(arr_of_latlngliteral) === false) {
        reject("Input not valid array.");
    }
    else if (arr_of_latlngliteral.length < 1) {
        reject("Array needs to contain at least one element.");
    }
    const lat_lng_literal = {
        east: -Infinity,
        west: Infinity,
        north: Infinity,
        south: -Infinity,
    };
    arr_of_latlngliteral.forEach((point) => {
        lat_lng_literal.west =
            point.lng < lat_lng_literal.west ? point.lng : lat_lng_literal.west;
        lat_lng_literal.east =
            point.lng > lat_lng_literal.east ? point.lng : lat_lng_literal.east;
        lat_lng_literal.north =
            point.lat < lat_lng_literal.north ? point.lat : lat_lng_literal.north;
        lat_lng_literal.south =
            point.lat > lat_lng_literal.south ? point.lat : lat_lng_literal.south;
    });
    if (map) {
        map.fitBounds(lat_lng_literal);
    }
    resolve();
});
export const setPolyline = (verbose, map, map_objects, cutting, id, options) => setMapObject(verbose, map, map_objects, cutting, "polyline", id, options);
export const setPolygon = (verbose, map, map_objects, cutting, id, options) => setMapObject(verbose, map, map_objects, cutting, "polygon", id, options);
export const setMarker = (verbose, map, map_objects, cutting, id, options) => setMapObject(verbose, map, map_objects, cutting, "marker", id, options);
export const setMapObject = (verbose, map, map_objects, cutting, type, id, options, selected_options_id = "default") => new Promise((resolve, reject) => {
    if (Object.prototype.hasOwnProperty.call(map_objects[type], id)) {
        //This ID has already been drawn.
        const map_obj = map_objects[type][id];
        const visible = map_obj.gmaps_obj.getVisible();
        const opts = Object.assign({}, map_obj.options[selected_options_id], options[selected_options_id], { visible: visible });
        map_obj.selected_options_id = selected_options_id;
        switch (map_obj.type) {
            case "polyline": {
                map_obj.gmaps_obj.setOptions(opts);
                map_obj.options = options;
                break;
            }
            case "polygon": {
                map_obj.gmaps_obj.setOptions(opts);
                map_obj.options = options;
                break;
            }
            case "marker": {
                map_obj.gmaps_obj.setOptions(opts);
                map_obj.options = options;
                break;
            }
            default: {
                reject(new Error("Invalid map object type."));
            }
        }
        resolve(map_obj);
        return;
    }
    const map_obj_shell = {
        _cbs: {},
        type: type,
        selected_options_id: selected_options_id,
    };
    let events = [];
    let path_events = [];
    switch (type) {
        case "marker": {
            const opts = Object.assign({}, DEFAULT_MARKER_OPTIONS, options.default);
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
                "rightclick",
            ];
            break;
        }
        case "polygon": {
            const opts = Object.assign({}, DEFAULT_POLYGON_OPTIONS, options.default);
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
                "rightclick",
            ];
            path_events = ["set_at", "remove_at", "insert_at"];
            break;
        }
        case "polyline": {
            const opts = Object.assign({}, DEFAULT_POLYLINE_OPTIONS, options.default);
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
                "rightclick",
            ];
            path_events = ["set_at", "remove_at", "insert_at"];
            break;
        }
        default: {
            reject(new Error("Invalid map object type."));
            return;
        }
    }
    map_obj_shell.registerEventCB = (event_type, cb) => {
        map_obj_shell._cbs[event_type] = cb;
    };
    map_obj_shell.unregisterEventCB = (event_type) => {
        if (Object.prototype.hasOwnProperty.call(map_obj_shell._cbs, event_type)) {
            delete map_obj_shell._cbs[event_type];
        }
    };
    map_obj_shell.remove = () => {
        return unsetMapObject(verbose, map_objects, cutting, type, id);
    };
    map_obj_shell.setOptions = (new_options) => {
        return setMapObject(verbose, map, map_objects, cutting, type, id, new_options, map_obj_shell.selected_options_id);
    };
    map_obj_shell.applyOptions = (options_id) => {
        if (!Object.prototype.hasOwnProperty.call(options, options_id)) {
            throw new Error("Tried to applyOptions(options_id) with '" +
                options_id +
                "', but options for given id are not defined.");
        }
        map_obj_shell.selected_options_id = options_id;
        const visible = map_obj_shell.gmaps_obj.getVisible();
        const opts_set = map_obj_shell.options;
        map_obj_shell.gmaps_obj.setOptions(Object.assign({}, opts_set.default, opts_set[options_id], {
            visible: visible,
        }));
    };
    map_obj_shell.hide = () => {
        map_obj_shell.gmaps_obj.setOptions(Object.assign({}, map_obj_shell.options[map_obj_shell.selected_options_id], { visible: false }));
    };
    map_obj_shell.show = () => {
        map_obj_shell.gmaps_obj.setOptions(Object.assign({}, map_obj_shell.options[map_obj_shell.selected_options_id], { visible: true }));
    };
    const map_obj = map_obj_shell;
    events.forEach((event_type) => {
        map_obj.gmaps_obj.addListener(event_type, (e) => {
            return mapObjectEventCB(cutting, map_obj, event_type, e);
        });
    });
    path_events.forEach((event_type) => {
        map_obj.gmaps_obj.getPath().addListener(event_type, (e) => {
            return mapObjectEventCB(cutting, map_obj, event_type, e);
        });
    });
    map_obj.gmaps_obj.setMap(map);
    switch (map_obj.type) {
        case "polyline": {
            map_obj.zoomTo = () => {
                panZoomToObjectOrFeature(map, map_obj, true);
            };
            map_obj.panTo = () => {
                panZoomToObjectOrFeature(map, map_obj, false);
            };
            map_objects[type][id] = map_obj;
            resolve(map_obj);
            break;
        }
        case "polygon": {
            map_obj.zoomTo = () => {
                panZoomToObjectOrFeature(map, map_obj, true);
            };
            map_obj.panTo = () => {
                panZoomToObjectOrFeature(map, map_obj, false);
            };
            map_objects[type][id] = map_obj;
            resolve(map_obj);
            break;
        }
        case "marker": {
            map_obj.zoomTo = () => {
                panZoomToObjectOrFeature(map, map_obj, true);
            };
            map_obj.panTo = () => {
                panZoomToObjectOrFeature(map, map_obj, false);
            };
            map_objects[type][id] = map_obj;
            resolve(map_obj);
            break;
        }
        default: {
            reject(new Error("Invalid map object type."));
        }
    }
    return;
});
export const unsetMapObject = (verbose, map_objects, cutting, type, id) => new Promise((resolve, reject) => {
    if (Object.prototype.hasOwnProperty.call(map_objects[type], id)) {
        //This ID has been drawn.
        if (cutting.id && cutting.id !== id) {
            //This object is currently being cut, it cannot be deleted.
            reject(new Error("MAP: Object is currently in cuttingMode; it cannot be removed!"));
            return;
        }
        map_objects[type][id].gmaps_obj.setMap(null);
        delete map_objects[type][id];
        resolve(true);
        return;
    }
    if (verbose) {
        return reject(new Error("MAP: MapObject does not exist."));
    }
    return resolve(true);
});
export const mapObjectEventCB = (cutting, map_obj, event_type, e) => {
    if (cutting.enabled) {
        //When the map is in cutting mode no object event callbacks are allowed.
        return true;
    }
    if (Object.prototype.hasOwnProperty.call(map_obj._cbs, event_type) &&
        map_obj._cbs[event_type]) {
        map_obj._cbs[event_type](e);
    }
    return true;
};
export const panZoomToObjectOrFeature = (map, obj, zoom = true) => {
    if (!map) {
        return;
    }
    if (Object.prototype.hasOwnProperty.call(obj, "gmaps_feature")) {
        if (zoom) {
            map.fitBounds(obj._bbox);
        }
        else {
            map.panToBounds(obj._bbox);
        }
        return;
    }
    obj = obj; //Reset typing.
    switch (obj.type) {
        case "marker": {
            const position = obj.gmaps_obj.getPosition();
            map.setCenter(position);
            if (zoom) {
                map.setZoom(14);
            }
            break;
        }
        case "polyline": {
            const bounds = {
                north: -Infinity,
                south: Infinity,
                west: Infinity,
                east: -Infinity,
            };
            obj.gmaps_obj.getPath().forEach((point) => {
                bounds.north = point.lat() > bounds.north ? point.lat() : bounds.north;
                bounds.south = point.lat() < bounds.south ? point.lat() : bounds.south;
                bounds.west = point.lng() < bounds.west ? point.lng() : bounds.west;
                bounds.east = point.lng() > bounds.east ? point.lng() : bounds.east;
            });
            if (zoom) {
                map.fitBounds(bounds);
            }
            else {
                map.panToBounds(bounds);
            }
            break;
        }
        case "polygon": {
            const bounds = {
                north: -Infinity,
                south: Infinity,
                west: Infinity,
                east: -Infinity,
            };
            obj.gmaps_obj.getPaths().forEach((path) => {
                path.forEach((point) => {
                    bounds.north =
                        point.lat() > bounds.north ? point.lat() : bounds.north;
                    bounds.south =
                        point.lat() < bounds.south ? point.lat() : bounds.south;
                    bounds.west = point.lng() < bounds.west ? point.lng() : bounds.west;
                    bounds.east = point.lng() > bounds.east ? point.lng() : bounds.east;
                });
            });
            if (zoom) {
                map.fitBounds(bounds);
            }
            else {
                map.panToBounds(bounds);
            }
            break;
        }
    }
};

//# sourceMappingURL=internal_helpers.js.map
