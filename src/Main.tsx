import React from 'react';
import MapBase from './module';


const Main = () => {
    return (
        <div>
            <p>MAIN</p>
            <div style={{width: "100%", height: "90%"}}>
                <MapBase
                    googleapi_maps_uri="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,places,drawing&key=AIzaSyA0tp0r6ImLSnn9vy4zXjZWar1F3U5eOaY"
                />
            </div>
        </div>
    );
};

export default Main;
