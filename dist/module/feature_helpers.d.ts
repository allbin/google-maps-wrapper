/// <reference types="googlemaps" />
export declare const setupLayerEvents: (map_objects: MapObjects, layer: google.maps.Data) => void;
export declare const setGeoJSONFeature: (map: google.maps.Map, map_objects: MapObjects, features_layer: google.maps.Data, feature: GeoJSONFeature<any, null>, options: FeatureOptionsSet, layer?: google.maps.Data | undefined) => Promise<WrappedFeature>;
export declare const setGeoJSONCollection: (map: google.maps.Map, map_objects: MapObjects, collection: GeoJSONFeatureCollection<any, any>, options: FeatureOptionsSet) => Promise<{
    layer: google.maps.Data;
    features: WrappedFeature[];
}>;
