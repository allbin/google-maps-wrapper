/// <reference types="googlemaps" />
import { GMW_FeatureOptionsSet, GMW_WrappedFeature } from ".";
export declare const setupLayerEvents: (map_objects: MapObjects, layer: google.maps.Data) => void;
export declare const setGeoJSONFeature: (map: google.maps.Map, map_objects: MapObjects, features_layer: google.maps.Data, feature: GeoJSONFeature<any, null>, options: GMW_FeatureOptionsSet, layer?: google.maps.Data | undefined) => Promise<GMW_WrappedFeature>;
export declare const setGeoJSONCollection: (map: google.maps.Map, map_objects: MapObjects, collection: GeoJSONFeatureCollection<any, any>, options: GMW_FeatureOptionsSet) => Promise<{
    layer: google.maps.Data;
    features: GMW_WrappedFeature[];
}>;
