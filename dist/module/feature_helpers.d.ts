/// <reference types="googlemaps" />
import { GMW_FeatureOptionsSet, GMW_WrappedFeature, GMW_GeoJSONFeatureCollection, GMW_GeoJSONFeature } from ".";
import { MapObjects } from "./WrappedMapBase";
export declare const setupLayerEvents: (map_objects: MapObjects, layer: google.maps.Data) => void;
export declare const setGeoJSONFeature: (map: google.maps.Map, map_objects: MapObjects, features_layer: google.maps.Data, feature: GMW_GeoJSONFeature, options: GMW_FeatureOptionsSet, layer?: google.maps.Data | undefined) => Promise<GMW_WrappedFeature>;
export declare const setGeoJSONCollection: (map: google.maps.Map, map_objects: MapObjects, collection: GMW_GeoJSONFeatureCollection, options: GMW_FeatureOptionsSet) => Promise<{
    layer: google.maps.Data;
    features: GMW_WrappedFeature[];
}>;
