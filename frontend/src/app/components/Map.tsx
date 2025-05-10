import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

const MapboxExample = () => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    
    // State to track if we are on the client (to prevent SSR hydration issues)
    const [isClient, setIsClient] = useState(false);
    
    useEffect(() => {
        // Ensure the Mapbox code runs only on the client
        setIsClient(true);
    }, []);
    
    useEffect(() => {
        if (!isClient) return;
        if (map.current) return;
        if (!mapContainerRef.current) return;
        
        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_GL_ACCESS_TOKEN;
        
        // Initialize the map
        map.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [-24, 42], // Default center if geolocation fails
            zoom: 1,
        });
        
        // Add geolocate control to the map
        const geolocateControl = new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true,
            },
            trackUserLocation: true,
            showUserHeading: true,
        });
        
        // Add the control to the map
        map.current.addControl(geolocateControl, 'bottom-right');
        
        map.current.on('load', () => {
            if (!map.current) return;
            
            geolocateControl.trigger();
            
            map.current.flyTo({
                center: map.current.getCenter(),
                duration: 3800, //map recenter animation
                zoom: 15,
                essential: true, // Ensures animation isn't skipped
            });
        });
        
        return () => {
            if (!map.current) return;
            map.current.remove();
        };
    }, [isClient]);
    
    if (!isClient) {
        return <div id="map" style={{ height: '100%' }}></div>; // Render a placeholder until client-side is ready
    }
    
    return <div id="map" ref={mapContainerRef} style={{ height: '100%' }}></div>;
};

export default MapboxExample;
