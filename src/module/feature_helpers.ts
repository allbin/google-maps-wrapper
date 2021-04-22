/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { panZoomToObjectOrFeature } from './internal_helpers';
import {
  GMW_FeatureEvents,
  GMW_FeatureOptionsSet,
  GMW_WrappedFeature,
  GMW_GeoJSONFeatureCollection,
  GMW_GeoJSONFeature,
} from '.';
import { MapObjects } from './WrappedMapBase';

const feature_events: GMW_FeatureEvents[] = [
  'click',
  'mouseover',
  'mouseout',
  'mousedown',
  'mouseup',
  'rightclick',
];

export const setupLayerEvents = (
  map_objects: MapObjects,
  layer: google.maps.Data,
): void => {
  feature_events.forEach((event_type) => {
    layer.addListener(
      event_type,
      (data_mouse_event: google.maps.Data.MouseEvent) => {
        const feature_id = data_mouse_event.feature.getId();
        const wrapped_feature = map_objects.features[feature_id];
        if (wrapped_feature && wrapped_feature._cbs[event_type]) {
          wrapped_feature._cbs[event_type](data_mouse_event);
        }
      },
    );
  });
};

const wrapGmapsFeature = (
  map: google.maps.Map,
  map_objects: MapObjects,
  layer: google.maps.Data,
  gmaps_feature: google.maps.Data.Feature,
  options: GMW_FeatureOptionsSet,
): GMW_WrappedFeature => {
  interface WrappedFeatureShell extends Partial<GMW_WrappedFeature> {
    gmaps_feature: google.maps.Data.Feature;
    options: GMW_FeatureOptionsSet;
    selected_options_id: string;
    _visible: boolean;
    _cbs: { [key: string]: (e: google.maps.Data.MouseEvent) => void };
    _bbox: google.maps.LatLngBounds;
  }

  const wrapped_feature: WrappedFeatureShell = {
    gmaps_feature: gmaps_feature,
    options: options,
    selected_options_id: 'default',
    _visible:
      options.default.visible !== undefined ? options.default.visible : true,
    _cbs: {},
    _bbox: new window.google.maps.LatLngBounds(),
  };
  gmaps_feature.getGeometry().forEachLatLng((point) => {
    wrapped_feature._bbox.extend(point);
  });
  wrapped_feature.setOptions = (new_options: GMW_FeatureOptionsSet) => {
    wrapped_feature.options = new_options;
    return Promise.resolve(wrapped_feature as GMW_WrappedFeature);
  };
  wrapped_feature.applyOptions = (options_id: string) => {
    if (!Object.prototype.hasOwnProperty.call(options, options_id)) {
      throw new Error(
        `Tried to applyOptions(options_id) with '${options_id}', but options for given id are not defined.`,
      );
    }
    wrapped_feature.selected_options_id = options_id;
    const new_options = Object.assign(
      {},
      options.default,
      options[wrapped_feature.selected_options_id],
      { visible: wrapped_feature._visible },
    );
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
    panZoomToObjectOrFeature(map, wrapped_feature as GMW_WrappedFeature, true);
  };
  wrapped_feature.panTo = () => {
    panZoomToObjectOrFeature(map, wrapped_feature as GMW_WrappedFeature, false);
  };

  wrapped_feature.applyOptions('default');

  return (wrapped_feature as unknown) as GMW_WrappedFeature;
};

export const setGeoJSONFeature = (
  map: google.maps.Map,
  map_objects: MapObjects,
  features_layer: google.maps.Data,
  feature: GMW_GeoJSONFeature,
  options: GMW_FeatureOptionsSet,
  layer?: google.maps.Data,
): Promise<GMW_WrappedFeature> =>
  new Promise((resolve, reject) => {
    if (
      Object.prototype.hasOwnProperty.call(map_objects.features, feature.id)
    ) {
      const wrapped_feature = map_objects.features[feature.id];
      wrapped_feature.remove();
    }

    if (!layer) {
      if (!features_layer) {
        return reject(
          'Internal error in map wrapper: Features layer not created.',
        );
      }
    }
    const feature_layer = features_layer;
    const gmaps_feature = feature_layer.addGeoJson(feature)[0];
    const wrapped_feature = wrapGmapsFeature(
      map,
      map_objects,
      feature_layer,
      gmaps_feature,
      options,
    );
    map_objects.features[feature.id] = wrapped_feature;
    resolve(wrapped_feature);
  });

export const setGeoJSONCollection = (
  map: google.maps.Map,
  map_objects: MapObjects,
  collection: GMW_GeoJSONFeatureCollection,
  options: GMW_FeatureOptionsSet,
): Promise<{
  layer: google.maps.Data;
  features: GMW_WrappedFeature[];
}> =>
  new Promise((resolve) => {
    const layer = new window.google.maps.Data() as google.maps.Data;
    layer.setMap(map);
    setupLayerEvents(map_objects, layer);

    const features: GMW_WrappedFeature[] = layer
      .addGeoJson(collection)
      .map((gmaps_feature) => {
        const wrapped_feature = wrapGmapsFeature(
          map,
          map_objects,
          layer,
          gmaps_feature,
          options,
        );
        map_objects.features[gmaps_feature.getId()] = wrapped_feature;
        return wrapped_feature;
      });

    layer.setStyle(options.default);
    resolve({
      layer: layer,
      features: features,
    });
  });
