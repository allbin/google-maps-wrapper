import WrappedMapBase, { AnyObjectOptions, WrappedGmapObj, AllMapObjEvents, LatLng, LatLngLiteral, MapObjectType, PolylineOptions, WrappedPolyline, MarkerOptions, WrappedMarker, PolygonOptions, WrappedPolygon } from './';

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


export function fromLatLngToPixel(map_ref: WrappedMapBase, latLng: LatLng) {
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

export function fitToBoundsOfArray(map_ref: WrappedMapBase, arr_of_coords: [number, number][]) {
    //Takes [[x, y], ...] array.
    return new Promise((resolve, reject) => {
        if (Array.isArray(arr_of_coords) === false) {
            reject("Input not valid array.");
        } else if (arr_of_coords.length < 1) {
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
export function fitToBoundsOfObjectArray(map_ref: WrappedMapBase, arr_of_latlngliteral: LatLngLiteral[]) {
    //Takes [{ lat: ?, lng: ? }, ...] array.
    return new Promise((resolve, reject) => {
        if (Array.isArray(arr_of_latlngliteral) === false) {
            reject("Input not valid array.");
        } else if (arr_of_latlngliteral.length < 1) {
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

export function setPolyline(map_ref: WrappedMapBase, id: string, options: PolylineOptions, hover_options: PolylineOptions | null = null): Promise<WrappedPolyline> {
    return setMapObject(map_ref, "polyline", id, options, hover_options) as Promise<WrappedPolyline>;
}
export function setPolygon(map_ref: WrappedMapBase, id: string, options: PolylineOptions, hover_options: PolylineOptions | null = null): Promise<WrappedPolygon> {
    return setMapObject(map_ref, "polygon", id, options, hover_options) as Promise<WrappedPolygon>;
}
export function setMarker(map_ref: WrappedMapBase, id: string, options: MarkerOptions, hover_options: MarkerOptions | null = null): Promise<WrappedMarker> {
    return setMapObject(map_ref, "marker", id, options, hover_options) as Promise<WrappedMarker>;
}

type setMapObject = (
    map_ref: WrappedMapBase,
    type: MapObjectType,
    id: string,
    options: AnyObjectOptions,
    hover_options: AnyObjectOptions | null
) => Promise<WrappedPolyline|WrappedPolygon|WrappedMarker>;

export const setMapObject: setMapObject = (map_ref, type, id, options, hover_options) => {

    return new Promise((resolve, reject) => {
        if (!map_ref.initialized) {
            console.log(map_ref);
            map_ref.do_after_init.push(() => {
                setMapObject(map_ref, type, id, options, hover_options).then((res) => {
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
            let opts;
            if (map_obj.hovered && hover_options) {
                opts = Object.assign({}, map_obj.options, options, hover_options);
            } else {
                opts = Object.assign({}, map_obj.options, options);
            }
            switch (map_obj.type) {
                case "polyline": {
                    map_obj.gmaps_obj.setOptions(opts as PolylineOptions);
                    map_obj.options = options as PolylineOptions;
                    if (hover_options) { map_obj.hover_options = hover_options as PolylineOptions; }
                    break;
                }
                case "polygon": {
                    map_obj.gmaps_obj.setOptions(opts as PolygonOptions);
                    map_obj.options = options as PolygonOptions;
                    if (hover_options) { map_obj.hover_options = hover_options as PolygonOptions; }
                    break;
                }
                case "marker": {
                    map_obj.gmaps_obj.setOptions(opts as MarkerOptions);
                    map_obj.options = options as MarkerOptions;
                    if (hover_options) { map_obj.hover_options = hover_options as MarkerOptions; }
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
        }

        let map_obj_shell: MapObjShell = {
            _cbs: {},
            hovered: false,
            type: type
        };
        let events: AllMapObjEvents[] = [];
        let path_events: AllMapObjEvents[] = [];
        switch (type) {
            case "marker": {
                let opts = Object.assign({}, DEFAULT_MARKER_OPTIONS, options);
                map_obj_shell.gmaps_obj = new window.google.maps.Marker(opts);
                map_obj_shell.options = opts;
                events = ["click", "mouseover", "mouseout", "mousedown", "mouseup", "dragstart", "drag", "dragend", "dblclick", "rightclick"];
                break;
            }
            case "polygon": {
                let opts = Object.assign({}, DEFAULT_POLYGON_OPTIONS, options);
                map_obj_shell.gmaps_obj = new window.google.maps.Polygon(opts);
                map_obj_shell.options = opts;
                events = ["click", "dblclick", "dragstart", "drag", "dragend", "mouseover", "mouseout", "mousedown", "mouseup", "mousemove", "rightclick"];
                path_events = ["set_at", "remove_at", "insert_at"];
                break;
            }
            case "polyline": {
                let opts = Object.assign({}, DEFAULT_POLYLINE_OPTIONS, options);
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
        map_obj_shell.hover_options = hover_options;

        map_obj_shell.registerEventCB = (event_type: string, cb) => {
            map_obj_shell._cbs[event_type] = cb;
        };
        map_obj_shell.unregisterEventCB = (event_type) => {
            if (map_obj_shell._cbs.hasOwnProperty(event_type)) {
                delete map_obj_shell._cbs[event_type];
            }
        };

        map_obj_shell.hover = () => {
            if (!map_obj_shell.hover_options) { return; }
            let opts = Object.assign({}, map_obj_shell.options, map_obj_shell.hover_options);
            let whitelisted_opts = {
                strokeColor: opts.strokeColor,
                strokeWidth: opts.strokeWidth,
                fillColor: opts.fillColor,
                fillOpacity: opts.fillOpacity
            };
            map_obj_shell.gmaps_obj.setOptions(whitelisted_opts);
            map_obj_shell.hovered = true;
        };
        map_obj_shell.unhover = () => {
            let opts = Object.assign({}, map_obj_shell.options);
            let whitelisted_opts = {
                strokeColor: opts.strokeColor,
                strokeWidth: opts.strokeWidth,
                fillColor: opts.fillColor,
                fillOpacity: opts.fillOpacity
            };
            map_obj_shell.gmaps_obj.setOptions(whitelisted_opts);
            map_obj_shell.hovered = false;
        };
        map_obj_shell.remove = () => { return unsetMapObject(map_ref, type, id); };
        map_obj_shell.update = (new_options) => { return setMapObject(map_ref, type, id, new_options, hover_options); };
        map_obj_shell.update_hover = (new_hover_options) => { return setMapObject(map_ref, type, id, options, new_hover_options); };
        map_obj_shell.hide = () => {
            map_obj_shell.gmaps_obj.setOptions(Object.assign({}, map_obj_shell.options, { visible: false }));
        };
        map_obj_shell.show = () => {
            map_obj_shell.gmaps_obj.setOptions(Object.assign({}, map_obj_shell.options, { visible: true }));
        };
        let map_obj = map_obj_shell as WrappedGmapObj;
        events.forEach((event_type) => {
            map_obj.gmaps_obj.addListener(event_type, (e: any) => { return mapObjectEventCB(map_ref, map_obj, event_type, e); });
        });
        path_events.forEach((event_type) => {
            map_obj.gmaps_obj.getPath().addListener(event_type, (e: any) => { return mapObjectEventCB(map_ref, map_obj, event_type, e); });
        });

        map_obj.gmaps_obj.setMap(map_ref.map);

        switch (map_obj.type) {
            case "polyline": {
                map_ref.map_objects[type][id] = map_obj as WrappedPolyline;
                resolve(map_obj as WrappedPolyline);
                break;
            }
            case "polygon": {
                map_ref.map_objects[type][id] = map_obj as WrappedPolygon;
                resolve(map_obj as WrappedPolygon);
                break;
            }
            case "marker": {
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

export function unsetMapObject(map_ref: WrappedMapBase, type: MapObjectType, id: string) {
    return new Promise<boolean>((resolve, reject) => {
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

            if (map_ref.cutting.id !== id) {
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

export function mapObjectEventCB(map_ref: WrappedMapBase, map_obj: WrappedGmapObj, event_type: AllMapObjEvents, e: any) {
    if (map_ref.cutting.enabled) {
        //When the map is in cutting mode no object event callbacks are allowed.
        return true;
    }
    if (event_type === "mouseover") { map_obj.hover(); }
    if (event_type === "mouseout") { map_obj.unhover(); }

    if (map_obj._cbs.hasOwnProperty(event_type) && map_obj._cbs[event_type]) {
        map_obj._cbs[event_type](e);
    }
    return true;
}
