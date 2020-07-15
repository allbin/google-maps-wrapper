import WrappedMapBase from "./WrappedMapBase";
export default WrappedMapBase;
export { convertFromArrayOfArray, haversineDistance, latLngArrayToCoordArray, makeRectRT90, movePointsByCoord, MVCArrayToCoordArray, MVCArrayToObjArray, arrayRT90ToWGS84, arrayRT90ToWGS84LatLngObj, } from "./external_helpers";
declare global {
    interface Window {
        google: any;
    }
}
