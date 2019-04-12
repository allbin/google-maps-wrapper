/////////////////////////////////
//INTERNAL MAP HELPER FUNCTIONS
//These functions are not exported to enduser, only used
//internally by the map.
const DEFAULT_POLYLINE_OPTIONS = {
    visible: true
};
const DEFAULT_POLYGON_OPTIONS = {
    visible: true
};
const DEFAULT_MARKER_OPTIONS = {
    visible: true
};
export function fromLatLngToPixel(map_ref, latLng) {
    if (!map_ref.map) {
        throw new Error("Cannot call fromLatLngToPixel before init is finished.");
    }
    let map = map_ref.map;
    let bounds = map.getBounds();
    if (!bounds) {
        throw new Error("Map not mounted when calling fromLatLngToPixel");
    }
    var topRight = map.getProjection().fromLatLngToPoint(bounds.getNorthEast());
    var bottomLeft = map.getProjection().fromLatLngToPoint(bounds.getSouthWest());
    var scale = Math.pow(2, map.getZoom());
    var worldPoint = map.getProjection().fromLatLngToPoint(latLng);
    return new window.google.maps.Point((worldPoint.x - bottomLeft.x) * scale, (worldPoint.y - topRight.y) * scale);
}
export function fitToBoundsOfArray(map_ref, arr_of_coords) {
    //Takes [[x, y], ...] array.
    return new Promise((resolve, reject) => {
        if (Array.isArray(arr_of_coords) === false) {
            reject("Input not valid array.");
        }
        else if (arr_of_coords.length < 1) {
            reject("Array needs to countain at least one element.");
        }
        if (!map_ref.initialized) {
            map_ref.do_after_init.push(() => {
                fitToBoundsOfArray(map_ref, arr_of_coords).then((res) => {
                    resolve(res);
                }).catch((err) => {
                    reject(err);
                });
            });
            return;
        }
        let lat_lng_literal = {
            east: -99999999,
            west: 99999999,
            north: 99999999,
            south: -99999999
        };
        arr_of_coords.forEach((point) => {
            lat_lng_literal.west = (point[0] < lat_lng_literal.west) ? point[0] : lat_lng_literal.west;
            lat_lng_literal.east = (point[0] > lat_lng_literal.east) ? point[0] : lat_lng_literal.east;
            lat_lng_literal.north = (point[1] < lat_lng_literal.north) ? point[1] : lat_lng_literal.north;
            lat_lng_literal.south = (point[1] > lat_lng_literal.south) ? point[1] : lat_lng_literal.south;
        });
        if (map_ref.map) {
            map_ref.map.fitBounds(lat_lng_literal);
        }
        resolve();
    });
}
export function fitToBoundsOfObjectArray(map_ref, arr_of_latlngliteral) {
    //Takes [{ lat: ?, lng: ? }, ...] array.
    return new Promise((resolve, reject) => {
        if (Array.isArray(arr_of_latlngliteral) === false) {
            reject("Input not valid array.");
        }
        else if (arr_of_latlngliteral.length < 1) {
            reject("Array needs to countain at least one element.");
        }
        if (!map_ref.initialized) {
            map_ref.do_after_init.push(() => {
                fitToBoundsOfObjectArray(map_ref, arr_of_latlngliteral).then((res) => {
                    resolve(res);
                }).catch((err) => {
                    reject(err);
                });
            });
            return;
        }
        let lat_lng_literal = {
            east: -99999999,
            west: 99999999,
            north: 99999999,
            south: -99999999
        };
        arr_of_latlngliteral.forEach((point) => {
            lat_lng_literal.west = (point.lng < lat_lng_literal.west) ? point.lng : lat_lng_literal.west;
            lat_lng_literal.east = (point.lng > lat_lng_literal.east) ? point.lng : lat_lng_literal.east;
            lat_lng_literal.north = (point.lat < lat_lng_literal.north) ? point.lat : lat_lng_literal.north;
            lat_lng_literal.south = (point.lat > lat_lng_literal.south) ? point.lat : lat_lng_literal.south;
        });
        if (map_ref.map) {
            map_ref.map.fitBounds(lat_lng_literal);
        }
        resolve();
    });
}
export function setPolyline(map_ref, id, options) {
    return setMapObject(map_ref, "polyline", id, options);
}
export function setPolygon(map_ref, id, options) {
    return setMapObject(map_ref, "polygon", id, options);
}
export function setMarker(map_ref, id, options) {
    return setMapObject(map_ref, "marker", id, options);
}
export const setMapObject = (map_ref, type, id, options, selected_options_id = 'default') => {
    return new Promise((resolve, reject) => {
        if (!map_ref.initialized) {
            map_ref.do_after_init.push(() => {
                setMapObject(map_ref, type, id, options, selected_options_id).then((res) => {
                    resolve(res);
                }).catch((err) => {
                    reject(err);
                });
            });
            return;
        }
        if (map_ref.map_objects[type].hasOwnProperty(id)) {
            //This ID has already been drawn.
            let map_obj = map_ref.map_objects[type][id];
            const visible = map_obj.gmaps_obj.getVisible();
            let opts = Object.assign({}, map_obj.options[selected_options_id], options[selected_options_id], { visible: visible });
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
        let map_obj_shell = {
            _cbs: {},
            type: type,
            selected_options_id: selected_options_id
        };
        let events = [];
        let path_events = [];
        switch (type) {
            case "marker": {
                let opts = Object.assign({}, DEFAULT_MARKER_OPTIONS, options.default);
                map_obj_shell.gmaps_obj = new window.google.maps.Marker(opts);
                map_obj_shell.options = opts;
                events = ["click", "mouseover", "mouseout", "mousedown", "mouseup", "dragstart", "drag", "dragend", "dblclick", "rightclick"];
                break;
            }
            case "polygon": {
                let opts = Object.assign({}, DEFAULT_POLYGON_OPTIONS, options.default);
                map_obj_shell.gmaps_obj = new window.google.maps.Polygon(opts);
                map_obj_shell.options = opts;
                events = ["click", "dblclick", "dragstart", "drag", "dragend", "mouseover", "mouseout", "mousedown", "mouseup", "mousemove", "rightclick"];
                path_events = ["set_at", "remove_at", "insert_at"];
                break;
            }
            case "polyline": {
                let opts = Object.assign({}, DEFAULT_POLYLINE_OPTIONS, options.default);
                map_obj_shell.gmaps_obj = new window.google.maps.Polyline(opts);
                map_obj_shell.options = opts;
                events = ["click", "dblclick", "dragstart", "drag", "dragend", "mouseover", "mouseout", "mousedown", "mouseup", "mousemove", "rightclick"];
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
            if (map_obj_shell._cbs.hasOwnProperty(event_type)) {
                delete map_obj_shell._cbs[event_type];
            }
        };
        map_obj_shell.remove = () => { return unsetMapObject(map_ref, type, id); };
        map_obj_shell.setOptions = (new_options) => { return setMapObject(map_ref, type, id, new_options, map_obj_shell.selected_options_id); };
        map_obj_shell.applyOptions = (options_id) => {
            map_obj_shell.selected_options_id = options_id;
            const visible = map_obj_shell.gmaps_obj.getVisible();
            const opts_set = map_obj_shell.options;
            map_obj_shell.gmaps_obj.setOptions(Object.assign({}, opts_set.default, opts_set[options_id], { visible: visible }));
        };
        map_obj_shell.hide = () => {
            map_obj_shell.gmaps_obj.setOptions(Object.assign({}, map_obj_shell.options[map_obj_shell.selected_options_id], { visible: false }));
        };
        map_obj_shell.show = () => {
            map_obj_shell.gmaps_obj.setOptions(Object.assign({}, map_obj_shell.options[map_obj_shell.selected_options_id], { visible: true }));
        };
        let map_obj = map_obj_shell;
        events.forEach((event_type) => {
            map_obj.gmaps_obj.addListener(event_type, (e) => { return mapObjectEventCB(map_ref, map_obj, event_type, e); });
        });
        path_events.forEach((event_type) => {
            map_obj.gmaps_obj.getPath().addListener(event_type, (e) => { return mapObjectEventCB(map_ref, map_obj, event_type, e); });
        });
        map_obj.gmaps_obj.setMap(map_ref.map);
        switch (map_obj.type) {
            case "polyline": {
                map_obj.zoomTo = () => {
                    panZoomToObjectOrFeature(map_ref, map_obj, true);
                };
                map_obj.panTo = () => {
                    panZoomToObjectOrFeature(map_ref, map_obj, false);
                };
                map_ref.map_objects[type][id] = map_obj;
                resolve(map_obj);
                break;
            }
            case "polygon": {
                map_obj.zoomTo = () => {
                    panZoomToObjectOrFeature(map_ref, map_obj, true);
                };
                map_obj.panTo = () => {
                    panZoomToObjectOrFeature(map_ref, map_obj, false);
                };
                map_ref.map_objects[type][id] = map_obj;
                resolve(map_obj);
                break;
            }
            case "marker": {
                map_obj.zoomTo = () => {
                    panZoomToObjectOrFeature(map_ref, map_obj, true);
                };
                map_obj.panTo = () => {
                    panZoomToObjectOrFeature(map_ref, map_obj, false);
                };
                map_ref.map_objects[type][id] = map_obj;
                resolve(map_obj);
                break;
            }
            default: {
                reject(new Error("Invalid map object type."));
            }
        }
        return;
    });
};
export function unsetMapObject(map_ref, type, id) {
    return new Promise((resolve, reject) => {
        if (!map_ref.initialized) {
            map_ref.do_after_init.push(() => {
                unsetMapObject(map_ref, type, id).then((res) => {
                    resolve(res);
                }).catch((err) => {
                    reject(err);
                });
            });
            return;
        }
        if (map_ref.map_objects[type].hasOwnProperty(id)) {
            //This ID has been drawn.
            if (map_ref.cutting.id && map_ref.cutting.id !== id) {
                //This object is currently being cut, it cannot be deleted.
                reject(new Error("MAP: Object is currently in cuttingMode; it cannot be removed!"));
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
export function mapObjectEventCB(map_ref, map_obj, event_type, e) {
    if (map_ref.cutting.enabled) {
        //When the map is in cutting mode no object event callbacks are allowed.
        return true;
    }
    if (map_obj._cbs.hasOwnProperty(event_type) && map_obj._cbs[event_type]) {
        map_obj._cbs[event_type](e);
    }
    return true;
}
export function panZoomToObjectOrFeature(map_ref, obj, zoom = true) {
    if (!map_ref.map) {
        return;
    }
    if (obj.hasOwnProperty("gmaps_feature")) {
        if (zoom) {
            map_ref.map.fitBounds(obj._bbox);
        }
        else {
            map_ref.map.panToBounds(obj._bbox);
        }
        return;
    }
    obj = obj; //Reset typing.
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
                north: -9999,
                south: 9999,
                west: 9999,
                east: -9999
            };
            obj.gmaps_obj.getPath().forEach((point) => {
                bounds.north = point.lat() > bounds.north ? point.lat() : bounds.north;
                bounds.south = point.lat() < bounds.south ? point.lat() : bounds.south;
                bounds.west = point.lng() < bounds.west ? point.lng() : bounds.west;
                bounds.east = point.lng() > bounds.east ? point.lng() : bounds.east;
            });
            if (zoom) {
                map_ref.map.fitBounds(bounds);
            }
            else {
                map_ref.map.panToBounds(bounds);
            }
            break;
        }
        case "polygon": {
            let bounds = {
                north: -9999,
                south: 9999,
                west: 9999,
                east: -9999
            };
            obj.gmaps_obj.getPaths().forEach((path) => {
                path.forEach((point) => {
                    bounds.north = point.lat() > bounds.north ? point.lat() : bounds.north;
                    bounds.south = point.lat() < bounds.south ? point.lat() : bounds.south;
                    bounds.west = point.lng() < bounds.west ? point.lng() : bounds.west;
                    bounds.east = point.lng() > bounds.east ? point.lng() : bounds.east;
                });
            });
            if (zoom) {
                map_ref.map.fitBounds(bounds);
            }
            else {
                map_ref.map.panToBounds(bounds);
            }
            break;
        }
    }
}

//# sourceMappingURL=internal_helpers.js.map
