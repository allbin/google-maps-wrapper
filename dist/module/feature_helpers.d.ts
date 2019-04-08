/// <reference types="googlemaps" />
import WrappedMapBase, { GeoJSONFeatureCollection, FeatureOptionsSet, WrappedFeature, GeoJSONFeature } from '.';
declare type setupLayerEvents = (map_ref: WrappedMapBase, layer: google.maps.Data) => void;
export declare const setupLayerEvents: setupLayerEvents;
declare type setGeoJSONFeature = (map_ref: WrappedMapBase, feature: GeoJSONFeature, options: FeatureOptionsSet, layer?: google.maps.Data | null) => Promise<WrappedFeature>;
export declare const setGeoJSONFeature: setGeoJSONFeature;
declare type setGeoJSONCollection = (map_ref: WrappedMapBase, collection: GeoJSONFeatureCollection, options: FeatureOptionsSet) => Promise<{
    layer: google.maps.Data;
    features: WrappedFeature[];
}>;
export declare const setGeoJSONCollection: setGeoJSONCollection;
export {};
