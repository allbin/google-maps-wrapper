/* eslint-disable @typescript-eslint/class-name-casing */
import WrappedMapBase from "./WrappedMapBase";
import proj4 from "proj4";
export default WrappedMapBase;
export { convertFromArrayOfArray, haversineDistance, latLngArrayToCoordArray, makeRectRT90, movePointsByCoord, MVCArrayToCoordArray, MVCArrayToObjArray, arrayRT90ToWGS84, arrayRT90ToWGS84LatLngObj, } from "./external_helpers";
import simplify from "./simplify";
export { simplify };
const PROJECTIONS = {
    gmaps: "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0.0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs +over",
    rt90: "+proj=tmerc +lat_0=0 +lon_0=15.80827777777778 +k=1 +x_0=1500000 +y_0=0 +ellps=bessel +towgs84=414.1,41.3,603.1,-0.855,2.141,-7.023,0 +units=m +no_defs",
    sweref99: "+proj=tmerc +lat_0=0 +lon_0=15.80628452944445 +k=1.00000561024 +x_0=1500064.274 +y_0=-667.711 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
};
proj4.defs("GMAPS", PROJECTIONS.gmaps);
proj4.defs("RT90", PROJECTIONS.rt90);
proj4.defs("SWEREF99", PROJECTIONS.sweref99);

//# sourceMappingURL=index.js.map
