import WrappedMapBase, { GeoJSONFeatureCollection, FeatureOptionsSet, WrappedFeature, GeoJSONFeature, FeatureEvents } from '.';

const feature_events: FeatureEvents[] = ["click" , "mouseover" , "mouseout" , "mousedown" , "mouseup" , "rightclick"];

type setupLayerEvents = (
    map_ref: WrappedMapBase,
    layer: google.maps.Data
) => void;
export const setupLayerEvents: setupLayerEvents = (map_ref, layer) => {
    feature_events.forEach((event_type) => {
        layer.addListener(event_type, (data_mouse_event: google.maps.Data.MouseEvent) => {
            const feature_id = data_mouse_event.feature.getId();
            const wrapped_feature = map_ref.map_objects.features[feature_id];
            if (wrapped_feature && wrapped_feature._cbs[event_type]) {
                wrapped_feature._cbs[event_type](data_mouse_event);
            }
        });
    });
};


type wrapGmapsFeature = (
    layer: google.maps.Data,
    gmaps_feature: google.maps.Data.Feature,
    options: FeatureOptionsSet
) => WrappedFeature;
const wrapGmapsFeature: wrapGmapsFeature = (layer, gmaps_feature, options) => {
    interface WrappedFeatureShell extends Partial<WrappedFeature> {
        gmaps_feature: any;
        options: FeatureOptionsSet;
        selected_options_id: string;
        _visible: boolean;
        _cbs: { [key: string]: (e: google.maps.Data.MouseEvent) => void };
    }

    let wrapped_feature: WrappedFeatureShell = {
        gmaps_feature: gmaps_feature,
        options: options,
        selected_options_id: 'default',
        _visible: options.default.visible !== undefined ? options.default.visible : true,
        _cbs: {}
    };
    wrapped_feature.setOptions = (new_options: FeatureOptionsSet) => {
        wrapped_feature.options = new_options;
        return Promise.resolve(wrapped_feature as WrappedFeature);
    };
    wrapped_feature.applyOptions = (options_id: string) => {
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


    wrapped_feature.applyOptions('default');

    return wrapped_feature as unknown as WrappedFeature;
};


type setGeoJSONFeature = (
    map_ref: WrappedMapBase,
    feature: GeoJSONFeature,
    options: FeatureOptionsSet,
    layer?: google.maps.Data | null
) => Promise<WrappedFeature>;
export const setGeoJSONFeature: setGeoJSONFeature = (map_ref, feature, options, layer = null) => {
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
            layer = map_ref.features_layer!;
        }
        const gmaps_feature = layer.addGeoJson(feature)[0];
        const wrapped_feature = wrapGmapsFeature(layer, gmaps_feature, options);
        map_ref.map_objects.features[feature.id] = wrapped_feature;
        resolve(wrapped_feature);
    });
};

type setGeoJSONCollection = (
    map_ref: WrappedMapBase,
    collection: GeoJSONFeatureCollection,
    options: FeatureOptionsSet
) => Promise<{
    layer: google.maps.Data,
    features: WrappedFeature[]
}>;
export const setGeoJSONCollection: setGeoJSONCollection = (map_ref, collection, options) => {
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

        let layer = new window.google.maps.Data() as google.maps.Data;
        layer.setMap(map_ref.map);
        setupLayerEvents(map_ref, layer);

        let features: WrappedFeature[] = layer.addGeoJson(collection).map((gmaps_feature) => {
            let wrapped_feature = wrapGmapsFeature(layer, gmaps_feature, options);
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
