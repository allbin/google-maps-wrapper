import React, { FunctionComponent, useState } from "react";
import MapBase, { arrayRT90ToWGS84 } from "./module";
import example_geo_json from "./example_geo_json";
import { ExportedFunctions } from "./module/WrappedMapBase";
import { MarkerClustererOptions } from "@google/markerclustererplus";

const Map: FunctionComponent = () => {
  const [funcs, setFuncs] = useState<ExportedFunctions>();
  const [cluster_markers, setClusterMarkers] = useState<WrappedMarker[]>([]);
  const onMapInitialized = (
    map: google.maps.Map,
    initial_funcs: ExportedFunctions
  ): void => {
    const marker_opts: MarkerOptions = {
      position: { lng: 14.40567, lat: 56.65918 },
      draggable: true,
    };
    setFuncs(initial_funcs);
    console.log("Adding draggable marker.");
    initial_funcs
      .setMarker("marker1", { default: marker_opts })
      .then((marker) => {
        setTimeout(() => {
          marker.panTo();
          console.log("Issuing panTo command for draggable marker.");
        }, 7000);
      });

    const polyline_opts: PolylineOptions = {
      path: [
        { lng: 14.40567, lat: 56.65918 },
        { lng: 14.50567, lat: 56.65918 },
        { lng: 14.50567, lat: 56.55918 },
        { lng: 14.40567, lat: 56.55918 },
      ],
      strokeColor: "#FF0000",
      strokeWeight: 3,
    };
    const polyline_hover: PolylineOptions = {
      strokeWeight: 4,
      strokeColor: "#CC0000",
    };
    console.log("Setting polyline.");
    initial_funcs.setPolyline("polyline1", {
      default: polyline_opts,
      hover: polyline_hover,
    });

    const polygon_opts: PolygonOptions = {
      paths: [
        { lng: 14.50567, lat: 56.75918 },
        { lng: 14.60567, lat: 56.75918 },
        { lng: 14.60567, lat: 56.65918 },
        { lng: 14.50567, lat: 56.65918 },
      ],
      strokeColor: "#FF0000",
      strokeWeight: 2,
      fillColor: "#FF0000",
      fillOpacity: 0.2,
    };
    const polygon_hover: PolygonOptions = {
      strokeWeight: 2,
      strokeColor: "#CC0000",
      fillOpacity: 0.6,
    };
    initial_funcs
      .setPolygon(2, {
        default: polygon_opts,
        hover: polygon_hover,
      })
      .then((polygon) => {
        polygon.registerEventCB("mouseover", () => {
          console.log("mouse over");
          polygon.applyOptions("hover");
        });
        polygon.registerEventCB("mouseout", () => {
          console.log("mouse out");
          polygon.applyOptions("default");
        });

        polygon_opts.strokeOpacity = 0.4;
        polygon.setOptions({ default: polygon_opts, hover: polygon_hover });
        setTimeout(() => {
          console.log("setTimeout");
          initial_funcs.zoomToObject(polygon);
        }, 2000);
      });

    example_geo_json.features[0].geometry.coordinates = example_geo_json.features[0].geometry.coordinates.map(
      (x: number[][][]) => {
        return x.map((y) => {
          return arrayRT90ToWGS84(y as [number, number][]);
        });
      }
    );
    initial_funcs
      .setGeoJSONCollection(example_geo_json, {
        default: { visible: true, fillColor: "#ff0000", fillOpacity: 0.3 },
        hover: { fillOpacity: 0.6 },
      })
      .then((x) => {
        x.features.forEach((y) => {
          console.log(y);
          y.registerEventCB("mouseover", () => {
            y.applyOptions("hover");
          });
          y.registerEventCB("mouseout", () => {
            y.applyOptions("default");
          });
        });
        setTimeout(() => {
          initial_funcs.panToObject(x.features[0]);
          console.log("pan to object");
        }, 4000);
      });
  };

  const rand = (min: number, max: number): number =>
    Math.random() * (max - min) + min;

  const addCluster = (
    funcs: ExportedFunctions,
    number_of_markers: number,
    min_lat: number,
    max_lat: number,
    min_lng: number,
    max_lng: number
  ): Promise<WrappedMarker[]> => {
    const promises = [] as Promise<WrappedMarker>[];
    const cluster_options: MarkerClustererOptions = {
      gridSize: 120,
      styles: [
        funcs.createClustererStyle({
          url: "./cluster.png",
          width: 53,
          height: 52,
          anchorIcon: [25, 22],
          textSize: 11,
          textColor: "#fff",
        }),
      ],
    };

    for (let i = 0; i < number_of_markers; i++) {
      const marker_opts: MarkerOptions = {
        position: { lng: rand(min_lng, max_lng), lat: rand(min_lat, max_lat) },
        draggable: true,
      };
      promises.push(funcs.setMarker("cluster_" + i, { default: marker_opts }));
    }
    return Promise.all(promises).then((markers) => {
      funcs.setClusterer(cluster_options).then((clusterer) => {
        clusterer.addMarkers(markers.map((marker) => marker.gmaps_obj));
      });
      return Promise.resolve(markers);
    });
  };

  const animateClusterMarkers = (step = 0): void => {
    for (let i = 0; i < cluster_markers.length; i++) {
      const marker = cluster_markers[i];
      const val = step < 7 ? 0.001 : -0.001;
      const opts = Object.assign({}, marker.options.default);
      const pos = marker.gmaps_obj.getPosition();
      if (i % 2 === 0) {
        opts.position = {
          lat: pos.lat() + val,
          lng: pos.lng(),
        };
      } else if (i % 3 === 0) {
        opts.position = {
          lat: pos.lat() + val,
          lng: pos.lng() + val,
        };
      } else {
        opts.position = {
          lat: pos.lat(),
          lng: pos.lng() + val,
        };
      }
      marker.setOptions({ default: opts });
    }

    setTimeout(() => animateClusterMarkers((step + 1) % 14), 1000);
    funcs?.getClusterers().then((clusterers) => {
      clusterers[0].repaint();
    });
  };

  return (
    <div>
      <button
        onClick={() => {
          if (!funcs) {
            return;
          }
          console.log("Starting DrawingMode");
          funcs.setDrawingMode(
            "polyline",
            {
              strokeColor: "#000000",
              strokeWeight: 3,
            },
            (path) => {
              console.log("path: ", path);
            }
          );
        }}
      >
        Start Drawing
      </button>

      <button
        onClick={() => {
          if (!funcs) {
            return;
          }
          console.log("Adding markers with clustering.");
          // lng: 14.50567, lat: 56.75918
          addCluster(funcs, 1000, 56, 57, 14, 15).then((markers) => {
            setClusterMarkers(markers);
          });
        }}
      >
        Add cluster markers
      </button>

      <button
        onClick={() => {
          console.log("Animating cluster markers.");
          animateClusterMarkers();
        }}
      >
        Animate cluster markers
      </button>

      <div style={{ position: "absolute", width: "90%", height: "90%" }}>
        <MapBase
          googleapi_maps_uri="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,places,drawing&key=AIzaSyA0tp0r6ImLSnn9vy4zXjZWar1F3U5eOaY"
          default_center={{ lng: 14.40567, lat: 56.65918 }}
          default_zoom={8}
          initializedCB={onMapInitialized}
        />
      </div>
    </div>
  );
};

export default Map;
