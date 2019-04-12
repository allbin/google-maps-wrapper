import React from 'react';
import MapBase, { MarkerOptions, PolylineOptions, PolygonOptions, arrayRT90ToWGS84 } from './module';
import example_geo_json from './example_geo_json';



export default class Map extends React.Component<any, any> {
    map: MapBase | null = null;

    onMapInitialized(ref: MapBase) {
        this.map = ref;

        let marker_opts: MarkerOptions = {
            position: { lng: 14.40567, lat: 56.65918 },
            draggable: true
        };
        this.map.setMarker("marker1", { default: marker_opts }).then((marker) => {
            setTimeout(() => {
                marker.panTo();
            }, 7000);
        });

        let polyline_opts: PolylineOptions = {
            path: [
                { lng: 14.40567, lat: 56.65918 },
                { lng: 14.50567, lat: 56.65918 },
                { lng: 14.50567, lat: 56.55918 },
                { lng: 14.40567, lat: 56.55918 }
            ],
            strokeColor: "#FF0000",
            strokeWeight: 3
        };
        let polyline_hover: PolylineOptions = {
            strokeWeight: 4,
            strokeColor: "#CC0000"
        };
        this.map.setPolyline("polyline1", {
            default: polyline_opts,
            hover: polyline_hover
        });

        let polygon_opts: PolygonOptions = {
            paths: [
                { lng: 14.50567, lat: 56.75918 },
                { lng: 14.60567, lat: 56.75918 },
                { lng: 14.60567, lat: 56.65918 },
                { lng: 14.50567, lat: 56.65918 }
            ],
            strokeColor: "#FF0000",
            strokeWeight: 2,
            fillColor: "#FF0000",
            fillOpacity: 0.2
        };
        let polygon_hover: PolygonOptions = {
            strokeWeight: 2,
            strokeColor: "#CC0000",
            fillOpacity: 0.6
        };
        this.map.setPolygon(2, {
            default: polygon_opts,
            hover: polygon_hover
        }).then((polygon) => {
            polygon.registerEventCB("mouseover", () => {
                polygon.applyOptions('hover');
            });
            polygon.registerEventCB("mouseout", () => {
                polygon.applyOptions('default');
            });

            polygon_opts.strokeOpacity = 0.4;
            polygon.setOptions({ default: polygon_opts, hover: polygon_hover });
            setTimeout(() => {
                if (this.map) {
                    this.map.zoomToObject(polygon);
                }
            }, 2000);
        });

        example_geo_json.features[0].geometry.coordinates = example_geo_json.features[0].geometry.coordinates.map((x: any) => {
            return x.map((y:any) => {
                return arrayRT90ToWGS84(y as [number, number][]);
            });
        });
        this.map.setGeoJSONCollection(example_geo_json, {
            default: { visible: true, fillColor: "#ff0000", fillOpacity: 0.3 },
            hover: { fillOpacity: 0.6 }
        }).then((x) => {
            x.features.forEach((y) => {
                console.log(y);
                y.registerEventCB('mouseover', () => {
                    y.applyOptions('hover');
                });
                y.registerEventCB('mouseout', () => {
                    y.applyOptions('default');
                });
            });
            setTimeout(() => {
                if (this.map) {
                    this.map.panToObject(x.features[0]);
                }
            }, 4000);
        });
    }

    render() {

        return (
            <div>
                <button
                    onClick={() => {
                        if (!this.map) {
                            return;
                        }
                        this.map.setDrawingMode("polyline", {
                            strokeColor: "#000000",
                            strokeWeight: 3
                        }, (path) => {
                            console.log("path: ", path);
                        });
                    }}
                >
                    Start Drawing
                </button>
                <div style={{position: "absolute", width: "90%", height: "90%"}}>
                    <MapBase
                        googleapi_maps_uri="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,places,drawing&key=AIzaSyA0tp0r6ImLSnn9vy4zXjZWar1F3U5eOaY"
                        default_center={{ lng: 14.40567, lat: 56.65918 }}
                        default_zoom={8}
                        initializedCB={(ref) => { this.onMapInitialized(ref); }}
                    />
                </div>
            </div>
        );
    }
}

