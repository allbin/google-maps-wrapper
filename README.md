# Google Maps Wrapper

## Changelog 2.6.18

Fixed issue where `onBoundsChanged` was not triggered when map bounds changed.
## Changelog 2.6.8

Fixed issue where drawing cancellation flag was not reset when starting a new drawing.

## Changelog 2.6.6

Fixed react peer dependency version.

## Changelog 2.6.5

Fixed invalid cutting mode return type.

## Changelog 2.6.3

Fixed bugs which prevented entering cutting mode.  
Fixed applying styles when starting drawing mode.

## Changelog 2.6.2

Fixed `cancelCuttingMode` so it cancels the drawing and also removes the drawn shape.

## Changelog 2.6.0

`completeCuttingMode` function now returns the cut shapes.

## Changelog 2.5.3

Exporting `simplify` functionality.

## Changelog 2.5.2

Exporting `GMW_AllMapObjEvents` type.

## Changelog 2.5.1

Exporting `GMW_GeoJSONFeature` and `GMW_GeoJSONFeatureCollection` types.

## Changelog 2.5.0

Exporting interfaces.

## Changelog 2.4.0

Added `places` to services.

## Changelog 2.3.0

Added `verbose` property to WrappedMapBase, defaults to false. It silences some non-critical errors such as deleting non-existing map objects.

## Changelog 2.2.0

Added `getBounds()` to exported funcs, returns google latlng bounds.  
Added `setBounds()` to exported funcs, takes latlng bounds or latlng bounds literal.  
Fixed types for `getServices()`.

## Changelog 2.1.0

Added `getServices()` to exported funcs.

## Changelog 2.0.0

Added `getClusterers()`, `setClasturer()`, `unsetClusterer()` and `CreateClustererStyle()` functions. These functions are the basis for clustering. Use setClusterer to create and register a clusterer with the map, unsetClusterer to remove it. These funcs are primarily a way to interact with the [gmaps clusterer](https://github.com/googlemaps/v3-utility-library/tree/master/packages/markerclustererplus).

Also removed all class components. This required breaking api changes. See TypeScript definitions for updated api.

## Changelog 1.3.0

Added `map.fitToBoundsLiteral()` function which will move and zoom the map to contain the bounds.

## Changelog 1.2.0

Added `map.getBoundsLiteral()` function which returns the current map bounds in LatLngBoundsLiteral format.

## Changelog 1.1.3

Fixed bug where options were not correctly saved on initial creation of Markers, Polylines and Polygons.

## Changelog 1.1.2

Fixed bug in detection if invalid options_id is supplied to `Feature.applyOptions(options_id)` function.

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
