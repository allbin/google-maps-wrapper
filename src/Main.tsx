import React from 'react';
import MapBase, { MarkerOptions, PolylineOptions, PolygonOptions } from './module';


export default class Map extends React.Component<any, any> {
    map: MapBase | null = null;

    onMapInitialized(ref: MapBase) {
        this.map = ref;

        let marker_opts: MarkerOptions = {
            position: { lng: 14.40567, lat: 56.65918 },
            draggable: true
        };
        this.map.setMarker("marker1", marker_opts);

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
        this.map.setPolyline("polyline1", polyline_opts, polyline_hover);

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
            fillOpacity: 0.5
        };
        let polygon_hover: PolygonOptions = {
            strokeWeight: 2,
            strokeColor: "#CC0000",
            fillOpacity: 0.3
        };
        this.map.setPolygon("polygon1", polygon_opts, polygon_hover).then((polygon) => {
            polygon.registerEventCB("click", () => {
                console.log("Clicked polygon.");
            });
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

