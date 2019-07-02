import { panZoomToObjectOrFeature } from './internal_helpers';
const feature_events = ["click", "mouseover", "mouseout", "mousedown", "mouseup", "rightclick"];
export const setupLayerEvents = (map_ref, layer) => {
    feature_events.forEach((event_type) => {
        layer.addListener(event_type, (data_mouse_event) => {
            const feature_id = data_mouse_event.feature.getId();
            const wrapped_feature = map_ref.map_objects.features[feature_id];
            if (wrapped_feature && wrapped_feature._cbs[event_type]) {
                wrapped_feature._cbs[event_type](data_mouse_event);
            }
        });
    });
};
const wrapGmapsFeature = (map_ref, layer, gmaps_feature, options) => {
    let wrapped_feature = {
        gmaps_feature: gmaps_feature,
        options: options,
        selected_options_id: 'default',
        _visible: options.default.visible !== undefined ? options.default.visible : true,
        _cbs: {},
        _bbox: new window.google.maps.LatLngBounds()
    };
    gmaps_feature.getGeometry().forEachLatLng((point) => {
        wrapped_feature._bbox.extend(point);
    });
    wrapped_feature.setOptions = (new_options) => {
        wrapped_feature.options = new_options;
        return Promise.resolve(wrapped_feature);
    };
    wrapped_feature.applyOptions = (options_id) => {
        if (options.hasOwnProperty(options_id) === false) {
            throw new Error("Tried to applyOptions(options_id) with '" + options_id + "', but options for given id are not defined.");
        }
        wrapped_feature.selected_options_id = options_id;
        let new_options = Object.assign({}, options.default, options[wrapped_feature.selected_options_id], { visible: wrapped_feature._visible });
        layer.overrideStyle(gmaps_feature, new_options);
    };
    wrapped_feature.show = () => {
        if (!wrapped_feature._visible && wrapped_feature.applyOptions) {
            wrapped_feature._visible = true;
            wrapped_feature.applyOptions(wrapped_feature.selected_options_id);
        }
    };
    wrapped_feature.hide = () => {
        if (wrapped_feature._visible && wrapped_feature.applyOptions) {
            wrapped_feature._visible = false;
            wrapped_feature.applyOptions(wrapped_feature.selected_options_id);
        }
    };
    wrapped_feature.remove = () => {
        layer.remove(gmaps_feature);
    };
    wrapped_feature.registerEventCB = (event_type, cb) => {
        wrapped_feature._cbs[event_type] = cb;
    };
    wrapped_feature.unregisterEventCB = (event_type) => {
        delete wrapped_feature._cbs[event_type];
    };
    wrapped_feature.zoomTo = () => {
        panZoomToObjectOrFeature(map_ref, wrapped_feature, true);
    };
    wrapped_feature.panTo = () => {
        panZoomToObjectOrFeature(map_ref, wrapped_feature, false);
    };
    wrapped_feature.applyOptions('default');
    return wrapped_feature;
};
export const setGeoJSONFeature = (map_ref, feature, options, layer = null) => {
    return new Promise((resolve, reject) => {
        if (!map_ref.initialized) {
            map_ref.do_after_init.push(() => {
                setGeoJSONFeature(map_ref, feature, options, layer).then((res) => {
                    resolve(res);
                }).catch((err) => {
                    reject(err);
                });
            });
            return;
        }
        if (map_ref.map_objects.features.hasOwnProperty(feature.id)) {
            let wrapped_feature = map_ref.map_objects.features[feature.id];
            wrapped_feature.remove();
        }
        if (!layer) {
            if (!map_ref.features_layer) {
                reject("Internal error in map wrapper: Features layer not created.");
            }
            layer = map_ref.features_layer;
        }
        const gmaps_feature = layer.addGeoJson(feature)[0];
        const wrapped_feature = wrapGmapsFeature(map_ref, layer, gmaps_feature, options);
        map_ref.map_objects.features[feature.id] = wrapped_feature;
        resolve(wrapped_feature);
    });
};
export const setGeoJSONCollection = (map_ref, collection, options) => {
    return new Promise((resolve, reject) => {
        if (!map_ref.initialized) {
            map_ref.do_after_init.push(() => {
                setGeoJSONCollection(map_ref, collection, options).then((res) => {
                    resolve(res);
                }).catch((err) => {
                    reject(err);
                });
            });
            return;
        }
        let layer = new window.google.maps.Data();
        layer.setMap(map_ref.map);
        setupLayerEvents(map_ref, layer);
        let features = layer.addGeoJson(collection).map((gmaps_feature) => {
            let wrapped_feature = wrapGmapsFeature(map_ref, layer, gmaps_feature, options);
            map_ref.map_objects.features[gmaps_feature.getId()] = wrapped_feature;
            return wrapped_feature;
        });
        layer.setStyle(options.default);
        resolve({
            layer: layer,
            features: features
        });
    });
};

//# sourceMappingURL=feature_helpers.js.map
