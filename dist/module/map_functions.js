import * as internal_helpers from "./internal_helpers";
import { haversineDistance, MVCArrayToCoordArray } from "./external_helpers";
import { CUTTING_SNAP_DISTANCE, Z_INDEX_SCISSORS, Z_INDEX_SCISSORS_HOVER, } from "./constants";
import ScissorIcon from "./img/marker_scissors.svg";
import ScissorHoverIcon from "./img/marker_scissors_hover.svg";
export const getBoundsLiteral = (map) => {
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
/*** Takes a coordinate and center it on the map  */
export const setCenter = (map, lat_lng) => {
    return new Promise((resolve) => {
        if (map) {
            map.setCenter(lat_lng);
        }
        resolve();
        return;
    });
};
export const toPixel = (lat_lng_input, html_element, overlay) => {
    if (!overlay) {
        throw new Error("Overlay not loaded when calling toPixel.");
    }
    const node_rect = html_element.getBoundingClientRect();
    let lat_lng;
    if (lat_lng_input instanceof google.maps.LatLng) {
        lat_lng = lat_lng_input;
    }
    else {
        lat_lng = new window.google.maps.LatLng(lat_lng_input);
    }
    const pixel_obj = overlay.getProjection().fromLatLngToContainerPixel(lat_lng);
    return [pixel_obj.x + node_rect.left, pixel_obj.y + node_rect.top];
};
export const setZoom = (zoom_level, map) => new Promise((resolve) => {
    map && map.setZoom(zoom_level);
    resolve();
    return;
});
export const clearPolylines = (map_objects, cutting) => {
    const promise_arr = [];
    Object.keys(map_objects.polyline).forEach((id) => {
        promise_arr.push(internal_helpers.unsetMapObject(map_objects, cutting, "polyline", id));
    });
    return Promise.all(promise_arr);
};
export const clearPolygons = (map_objects, cutting) => Promise.all(Object.keys(map_objects.polygon).map((id) => internal_helpers.unsetMapObject(map_objects, cutting, "polygon", id)));
export const setMarker = (map, map_objects, cutting, id, options) => internal_helpers.setMarker(map, map_objects, cutting, id, options);
export const clearMarkers = (map_objects, cutting) => Promise.all(Object.keys(map_objects.marker).map((id) => internal_helpers.unsetMapObject(map_objects, cutting, "marker", id)));
export const clearFeatureCollections = (map_objects, features_layer, feature_layers) => {
    feature_layers.forEach((x) => x.setMap(null));
    // feature_layers = [];
    if (features_layer) {
        Object.keys(map_objects.features).forEach((feature_key) => {
            map_objects.features[feature_key].remove();
        });
    }
};
export const setDrawingMode = (services, type, opts, cb, cancel_drawing, setDrawingCompletedListener, drawing_completed_listener) => {
    let mode = null;
    if (!services.drawing) {
        console.error("MAP: Drawing library not available! Add it to google maps api request url.");
        return;
    }
    if (Object.prototype.hasOwnProperty.call(services.drawing.OverlayType, type.toUpperCase())) {
        mode = services.drawing.OverlayType[type.toUpperCase()];
    }
    else {
        throw new Error("MAP: Invalid drawing mode type:" + type);
    }
    const drawing_opts = Object.assign({}, opts, { drawingMode: mode });
    services.drawingManager.setOptions(drawing_opts);
    console.log("MAP: Drawing mode started for:", type + ".");
    cancel_drawing = false;
    if (drawing_completed_listener) {
        drawing_completed_listener.remove();
    }
    setDrawingCompletedListener(google.maps.event.addListenerOnce(services.drawingManager, "overlaycomplete", (e) => {
        // console.log("overlay complete", cb, cancel_drawing);
        e.overlay.setMap(null);
        drawing_opts.drawingMode = null;
        services.drawingManager.setOptions(drawing_opts);
        if (!cb || cancel_drawing) {
            return;
        }
        if (type === "polyline" || type === "polygon") {
            const overlay = e.overlay;
            const path = MVCArrayToCoordArray(overlay.getPath());
            if (cb) {
                cb(path, overlay);
            }
        }
        else if (type === "marker") {
            const overlay = e.overlay;
            const pos = overlay.getPosition();
            cb([pos.lat(), pos.lng()], overlay);
        }
        else {
            cb(null, e.overlay);
        }
    }));
};
export const completeDrawingMode = (services, drawing_completed_listener) => {
    if (services.drawing) {
        services.drawingManager.setOptions({ drawingMode: null });
    }
    if (drawing_completed_listener) {
        drawing_completed_listener.remove();
    }
};
export const cancelDrawingMode = (services, cancel_drawing, drawing_completed_listener, debug_src) => {
    if (debug_src) {
        console.log("cancel drawing mode:", debug_src);
    }
    if (services.drawing && drawing_completed_listener) {
        cancel_drawing = true;
        services.drawingManager.setOptions({ drawingMode: null });
    }
};
export const setCuttingMode = (services, map, map_objects, cutting, cutting_objects, default_center, cancel_drawing, drawing_completed_listener, polyline_id, cutting_completed_listener, cb) => {
    if (!Object.prototype.hasOwnProperty.call(map_objects.polyline, polyline_id)) {
        console.error("MAP: Cannot set cutting mode, provided object id not on map: ", polyline_id);
        return;
    }
    if (!cb) {
        console.error("MAP: Cannot setCuttingMode without supplying completed callback.");
        return;
    }
    cancelDrawingMode(services, cancel_drawing, drawing_completed_listener, "setCuttingMode");
    const polyline = map_objects.polyline[polyline_id];
    const opts = {
        clickable: false,
        editable: false,
    };
    polyline.gmaps_obj.setOptions(opts);
    const path = polyline.options.path;
    cutting = {
        enabled: true,
        id: polyline_id,
        indexes: [],
        arr: path,
    };
    if (!Object.prototype.hasOwnProperty.call(cutting_objects, "hover_scissors")) {
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
    cutting_completed_listener = (value) => {
        if (cb) {
            cb(value);
        }
        else {
            throw new Error("Callback for cutting completed not defined.");
        }
    };
};
export const cuttingPositionUpdate = (mouse_event, map_objects, cutting, cutting_objects) => {
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
    polyline.gmaps_obj.getPath().forEach((point, i) => {
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
    if (closest_dist < CUTTING_SNAP_DISTANCE &&
        closest_index > 0 &&
        closest_index < path.length - 1) {
        cutting_objects.hover_scissors.gmaps_obj.setOptions({
            position: {
                lat: path[closest_index].lat(),
                lng: path[closest_index].lng(),
            },
            visible: true,
        });
    }
    else {
        cutting_objects.hover_scissors.gmaps_obj.setOptions({
            visible: false,
        });
    }
};
export const cuttingClick = (mouse_event, map, map_objects, cutting, cutting_objects) => {
    if (!cutting.id) {
        console.error("No cutting.id set when clicking for cut.");
        return;
    }
    if (!cutting.indexes) {
        console.error("cutting.indexes not defined when clicking for cut.");
        return;
    }
    const polyline = map_objects.polyline[cutting.id];
    const path = polyline.options.path;
    const mouse_coord = {
        lat: mouse_event.latLng.lat(),
        lng: mouse_event.latLng.lng(),
    };
    let closest_index = 0;
    let closest_dist = Infinity;
    path.forEach((point, i) => {
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
    if (closest_index === 0 || closest_index === path.length - 1) {
        //We are never interested in first or last point.
        return;
    }
    const already_selected_position = cutting.indexes.findIndex((value) => closest_index === value);
    if (already_selected_position > -1) {
        //This index has already been selected for cutting, remove it.
        cutting.indexes.splice(already_selected_position, 1);
        if (Object.prototype.hasOwnProperty.call(cutting_objects, "index_" + closest_index)) {
            //We have drawn a marker for cut, remove it.
            cutting_objects["index_" + closest_index].gmaps_obj.setMap(null);
            delete cutting_objects["index_" + closest_index];
        }
    }
    else {
        cutting.indexes.push(closest_index);
        const opts = {
            position: path[closest_index],
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
export const completeCuttingMode = (map_objects, cutting, cutting_objects, cutting_completed_listener) => {
    if (!cutting || cutting.id === null) {
        return;
    }
    const indexes = cutting.indexes;
    const polyline = map_objects.polyline[cutting.id];
    if (!polyline) {
        return;
    }
    // TODO do not reassign inside function
    cutting = {
        enabled: false,
        id: null,
        indexes: null,
    };
    Object.keys(cutting_objects).forEach((marker_id) => {
        //Remove all cutting related markers.
        cutting_objects[marker_id].gmaps_obj.setMap(null);
        delete cutting_objects[marker_id];
    });
    const opts = {
        clickable: true,
        editable: true,
    };
    polyline.gmaps_obj.setOptions(opts);
    if (!indexes || indexes.length === 0) {
        //We made no selections, just return.
        if (cutting_completed_listener) {
            cutting_completed_listener(null);
        }
        return;
    }
    const path = polyline.options.path;
    indexes.sort();
    //Add last index so that the remaining points form a segment as well.
    indexes.push(path.length - 1);
    const resulting_segments = [];
    let prev_index = 0;
    indexes.forEach((index) => {
        const segment = path.slice(prev_index, index);
        //Copy last point as well.
        segment.push(path[index]);
        resulting_segments.push(segment);
        prev_index = index;
    });
    if (cutting_completed_listener) {
        cutting_completed_listener(resulting_segments);
    }
};
export const cancelCuttingMode = (map_objects, cutting, cutting_objects) => {
    //TODO no reassign of prameter
    cutting = {
        enabled: false,
        id: null,
        indexes: null,
    };
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
//# sourceMappingURL=map_functions.js.map
