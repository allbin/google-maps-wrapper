# Google Maps Wrapper

## Changelog 1.1.1
Added detection if invalid options_id is supplied to `Feature.applyOptions(options_id)` function.

## Changelog 1.1.0
Added `Feature.zoomTo()` and `Feature.panTo()` functionality.  
Also extended `panToObject(item)` and `zoomToObject(item)` functions to also accept Features.

## Changelog 1.0.1
Fixed error in `Feature.applyOptions()`.

## Changelog 1.0.0
Updated API for managing options:  
- Polygons, Markers and Polylines now takes a set of options objects, one of which must be keyed `default`. EX: `setPolyline("my_id", my_options_set)`. Example options_set:
```
{
    default: {
        path: ...,
        strokeWeight: 4,
        fillOpacity: 0.3
        strokeOpacity: 0.5
    },
    hover: {
        strokeOpacity: 1
    },
    highlight: {
        fillOpacity: 0.8
        strokeOpacity: 1
    }
}
```

- Each WrappedMapObject has a new function `applyOptions(options_id)`. This function takes the default options and extends with whatever other options are specified. EX: `polyline.applyOptions('hover')` would apply `default` with _strokeOpacity_ of _1_.

Added support for adding GeoJson features and GeoJson feature collections:  
 - `setGeoJSONFeature(feature, feature_options_set)`
 - `setGeoJSONFeatureCollection(feature_collection, feature_options_set)`


## Changelog 0.3.1
Fixed error in helper function `convertFromArrayOfCoords` and other functions dependant on it.

## Changelog 0.3.0
Exporting helper functions from root. No need to initialize a map instance to access them.

## Changelog 0.2.1
Fixed invalid check for cutting mode when removing objects.

## Changelog 0.2.0
Added panTo and zoomTo functionality for map objects.
Added panToObject(object) and zoomToObject(object) functionality to map.

## Changelog 0.1.0
Added support for numeric ids.
