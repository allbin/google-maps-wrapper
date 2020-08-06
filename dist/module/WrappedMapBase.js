import React, { useEffect, useRef, useState } from "react";
import MarkerClusterer from "@google/markerclustererplus";
import ScriptCache from "./ScriptCache";
import * as feature_helpers from "./feature_helpers";
import * as map_funcs from "./map_functions";
import { panZoomToObjectOrFeature, setMarker, setPolygon, setPolyline, unsetMapObject, } from "./internal_helpers";
const setupMapEvents = (map, funcs, cutting, do_on_drag_start, do_on_drag_end, onBoundsChanged, onCenterChanged, onClick, onDoubleClick, onDrag, onDragEnd, onDragStart, onHeadingChanged, onIdle, onMapTypeIdChanged, onMouseMove, onMouseOut, onMouseOver, onProjectionChanged, onResize, onRightClick, onTilesLoaded, onTiltChanged, onZoomChanged) => {
    map.addListener("center_changed", () => onCenterChanged && onCenterChanged());
    map.addListener("bounds_changed", () => onBoundsChanged && onBoundsChanged());
    map.addListener("click", (mouse_event) => {
        if (!funcs) {
            throw new Error("funcs is undefined");
        }
        cutting.enabled && funcs.cuttingClick(mouse_event);
        onClick && !cutting.enabled && onClick(mouse_event);
    });
    map.addListener("dblclick", (mouse_event) => onDoubleClick && !cutting.enabled && onDoubleClick(mouse_event));
    map.addListener("drag", () => onDrag && !cutting.enabled && onDrag());
    map.addListener("dragend", () => onDragEnd && !cutting.enabled && onDragEnd());
    map.addListener("dragstart", () => {
        do_on_drag_start.forEach((cb) => {
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
        do_on_drag_end.forEach((cb) => {
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
    map.addListener("mousemove", (mouse_event) => {
        if (cutting.enabled) {
            if (!funcs) {
                throw new Error("funcs is undefined");
            }
            funcs.cuttingPositionUpdate(mouse_event);
        }
        if (onMouseMove) {
            onMouseMove(mouse_event);
        }
    });
    map.addListener("mouseout", (mouse_event) => {
        if (onMouseOut) {
            onMouseOut(mouse_event);
        }
    });
    map.addListener("mouseover", (mouse_event) => {
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
    map.addListener("rightclick", (mouse_event) => {
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
export const WrappedMapBase = ({ googleapi_maps_uri, default_center, default_options, default_zoom, onDoubleClick, onBoundsChanged, onCenterChanged, onClick, onDrag, onDragEnd, onDragStart, onHeadingChanged, onIdle, onMapTypeIdChanged, onMouseMove, onMouseOut, onMouseOver, onProjectionChanged, onResize, onRightClick, onTilesLoaded, onTiltChanged, onZoomChanged, styles, initializedCB, }) => {
    const [script_cache] = useState(ScriptCache({
        google: googleapi_maps_uri,
    }));
    const [clusterers] = useState([]);
    const [map, setMap] = useState();
    const [do_after_init] = useState([]);
    const [do_on_drag_end] = useState([]);
    const [do_on_drag_start] = useState([]);
    const [drawing_completed_listener, setDrawingCompletedListener] = useState();
    const [features_layer, setFeaturesLayer] = useState();
    const [feature_layers] = useState();
    const [map_objects] = useState({
        marker: {},
        polygon: {},
        polyline: {},
        features: {},
    });
    const [cutting_objects] = useState({});
    const [overlay, setOverlay] = useState();
    const [cutting] = useState({
        enabled: false,
        id: null,
        indexes: null,
    });
    const [cutting_completed_listener] = useState();
    const [cancel_drawing] = useState(false);
    const [services, setServices] = useState();
    const html_element_ref = useRef(null);
    const ic = (fn) => new Promise((resolve, reject) => {
        if (!map) {
            do_after_init.push((map) => {
                fn(map).then(resolve).catch(reject);
            });
        }
        else {
            fn(map).then(resolve);
        }
    });
    const [funcs, setFuncs] = useState();
    useEffect(() => {
        if (!html_element_ref.current) {
            throw new Error("html element not found.");
        }
        script_cache.google.onLoad(() => {
            const center = default_center;
            if (!center) {
                throw new Error("Could not create map: Requires 'default_center' prop.");
            }
            const zoom = typeof default_zoom !== "undefined" ? default_zoom : null;
            if (!zoom) {
                throw new Error("Could not create map: Requires 'default_zoom' prop.");
            }
            if (!googleapi_maps_uri) {
                throw new Error("Could not create map: Requires 'googleapi_maps_uri' prop. Ex: https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,places,drawing&key=XXXXXXXXXX");
            }
            const defaults = default_options || {};
            const mapConfig = Object.assign({}, defaults, {
                center: new window.google.maps.LatLng(center.lat, center.lng),
                zoom: zoom,
                gestureHandling: "greedy",
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
        const initial_services = {
            geocoderService: new window.google.maps.Geocoder(),
            directionsService: new window.google.maps.DirectionsService(),
        };
        if (window.google.maps.drawing) {
            initial_services.drawing = window.google.maps.drawing;
            initial_services.drawingManager = new window.google.maps.drawing.DrawingManager({
                drawingMode: null,
                drawingControl: false,
                drawingControlOptions: {
                    drawingModes: [],
                },
            });
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
            setCenter: (lat_lng) => ic((map) => map_funcs.setCenter(map, lat_lng)),
            setBounds: (lat_lng) => ic((map) => map_funcs.setBounds(map, lat_lng)),
            toPixel: (lat_lng_pixel) => map_funcs.toPixel(lat_lng_pixel, html_element_ref, overlay),
            setZoom: (zoom_level) => ic((map) => map_funcs.setZoom(zoom_level, map)),
            setPolyline: (id, options) => ic((map) => setPolyline(map, map_objects, cutting, id, options)),
            setPolygon: (id, options) => ic((map) => setPolygon(map, map_objects, cutting, id, options)),
            unsetPolyline: (id) => unsetMapObject(map_objects, cutting, "polyline", id),
            unsetPolygon: (id) => unsetMapObject(map_objects, cutting, "polygon", id),
            clearPolylines: () => map_funcs.clearPolylines(map_objects, cutting),
            clearPolygons: () => map_funcs.clearPolygons(map_objects, cutting),
            setMarker: (id, options) => ic((map) => setMarker(map, map_objects, cutting, id, options)),
            unsetMarker: (id) => unsetMapObject(map_objects, cutting, "marker", id),
            clearMarkers: () => map_funcs.clearMarkers(map_objects, cutting),
            setGeoJSONCollection: (collection, options) => ic((map) => feature_helpers.setGeoJSONCollection(map, map_objects, collection, options)),
            setGeoJSONFeature: (feature, options) => ic((map) => {
                if (!features_layer) {
                    throw new Error("features layer not loaded.");
                }
                return feature_helpers.setGeoJSONFeature(map, map_objects, features_layer, feature, options);
            }),
            clearFeatureCollections: () => {
                if (!features_layer || !feature_layers) {
                    throw new Error("features/feature layer/layers not loaded.");
                }
                map_funcs.clearFeatureCollections(map_objects, features_layer, feature_layers);
            },
            zoomToObject: (item) => map && panZoomToObjectOrFeature(map, item, true),
            panToObject: (item) => map && panZoomToObjectOrFeature(map, item, false),
            setDrawingMode: (type, opts, cb) => {
                map_funcs.setDrawingMode(services, type, opts, cb, cancel_drawing, setDrawingCompletedListener, drawing_completed_listener);
            },
            cancelDrawingMode: (cancel_drawing, debug_src) => drawing_completed_listener &&
                map_funcs.cancelDrawingMode(services, cancel_drawing, drawing_completed_listener, debug_src),
            setCuttingMode: (polyline_id, cb) => drawing_completed_listener &&
                cutting_completed_listener &&
                map_funcs.setCuttingMode(services, map, map_objects, cutting, cutting_objects, default_center, cancel_drawing, drawing_completed_listener, polyline_id, cutting_completed_listener, cb),
            cuttingPositionUpdate: (mouse_event) => map_funcs.cuttingPositionUpdate(mouse_event, map_objects, cutting, cutting_objects),
            cuttingClick: (mouse_event) => map_funcs.cuttingClick(mouse_event, map, map_objects, cutting, cutting_objects),
            completeCuttingMode: () => cutting_completed_listener &&
                map_funcs.completeCuttingMode(map_objects, cutting, cutting_objects, cutting_completed_listener),
            cancelCuttingMode: () => map_funcs.cancelCuttingMode(map_objects, cutting, cutting_objects),
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
            setClusterer: (clusterer_options) => ic((map) => {
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
            createClustererStyle: (styling) => MarkerClusterer.withDefaultStyle(styling),
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
        const initial_overlay = new CanvasProjectionOverlay( /***/);
        setOverlay(initial_overlay);
        if (initial_overlay) {
            initial_overlay.setMap(map);
        }
    }, [services]);
    useEffect(() => {
        if (!funcs || !map || !features_layer || !services) {
            return;
        }
        setupMapEvents(map, funcs, cutting, do_on_drag_start, do_on_drag_end, onBoundsChanged, onCenterChanged, onClick, onDoubleClick, onDrag, onDragEnd, onDragStart, onHeadingChanged, onIdle, onMapTypeIdChanged, onMouseMove, onMouseOut, onMouseOver, onProjectionChanged, onResize, onRightClick, onTilesLoaded, onTiltChanged, onZoomChanged);
        window.google.maps.event.addListenerOnce(map, "idle", () => doAfterInit(map));
    }, [funcs, features_layer]);
    useEffect(() => {
        if (!funcs || !map || !features_layer || !services) {
            return;
        }
        setupMapEvents(map, funcs, cutting, do_on_drag_start, do_on_drag_end, onBoundsChanged, onCenterChanged, onClick, onDoubleClick, onDrag, onDragEnd, onDragStart, onHeadingChanged, onIdle, onMapTypeIdChanged, onMouseMove, onMouseOut, onMouseOver, onProjectionChanged, onResize, onRightClick, onTilesLoaded, onTiltChanged, onZoomChanged);
    }, [
        map,
        funcs,
        cutting,
        do_on_drag_start,
        do_on_drag_end,
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
    const doAfterInit = (map) => {
        do_after_init.forEach((cb) => {
            cb(map);
        });
        if (initializedCB) {
            //Tell parent we are initialized if the parent has asked for it.
            if (!funcs) {
                throw new Error("funcs is undefined");
            }
            initializedCB(map, funcs);
        }
    };
    return (React.createElement("div", { style: { height: "100%" } },
        React.createElement("div", { ref: html_element_ref, style: {
                position: "absolute",
                top: "0",
                left: "0",
                right: "0",
                bottom: "0",
            } })));
};
export default WrappedMapBase;

//# sourceMappingURL=WrappedMapBase.js.map
