import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

import 'mapbox-gl/dist/mapbox-gl.css';
import render from "next/dist/compiled/@vercel/og/og";

type PlacesType = {
    name: string;
    address: string;
    location: {lat: number, lng: number};
    rating: number;
    open_now: boolean;
    description: string;
}

type ResType = {
    results: PlacesType[];
}

type mapProps = {
    setUserLocation: (lng: number, lat: number) => void;
    renderMarker: boolean;
    places: ResType | undefined;
}

const Map = ({setUserLocation, renderMarker, places} : mapProps) => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);
    const [mapLoad, setMapLoad] = useState(false);
    
    // State to track if we are on the client (to prevent SSR hydration issues)
    const [isClient, setIsClient] = useState(false);
    const [mapError, setMapError] = useState<string | null>(null);
    
    useEffect(() => {
        // Ensure the Mapbox code runs only on the client
        setIsClient(true);
    }, []);
    
    useEffect(() => {
        if (!isClient) return;
        if (map.current) return;
        if (!mapContainerRef.current) return;
        
        const token = process.env.NEXT_PUBLIC_MAPBOX_GL_ACCESS_TOKEN;
        if (!token) {
            setMapError('Mapbox access token is not defined');
            console.error('Mapbox access token is not defined. Please check your .env.local file');
            return;
        }
        
        try {
            mapboxgl.accessToken = token;
            
            // Initialize the map
            map.current = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: 'mapbox://styles/mapbox/streets-v12',
                center: [-71.402931, 41.826820], // Default center if geolocation fails
                zoom: 1,
            });
            
            // Add geolocate control to the map
            const geoLocateControl = new mapboxgl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true,
                },
                trackUserLocation: true,
                showUserHeading: true,
            });
            
            // Add the control to the map
            map.current.addControl(geoLocateControl, 'bottom-right');
            
            map.current.on('load', () => {
                if (!map.current) return;
                
                //get user's current location
                geoLocateControl.trigger(); //trigger geoLocation by default
                
                map.current.flyTo({
                    center: map.current.getCenter(),
                    duration: 3800, //map recenter animation
                    zoom: 15,
                    essential: true, // Ensures animation isn't skipped
                });
                
                const center = map.current.getCenter();
                setUserLocation(center.lng, center.lat);
                setMapLoad(true);
            });

            map.current.on('error', (e) => {
                console.error('Mapbox error:', e);
                setMapError('Error loading map');
                setMapLoad(false);
            });
            
            // return () => {
            //     if (map.current) {
            //         map.current.remove();
            //         // map.current = null;
            //     }
            // };
            
        } catch (error) {
            console.error('Error initializing map:', error);
            setMapError('Failed to initialize map');
            setMapLoad(false);
        }
    }, [isClient, setUserLocation]);
    
    useEffect(() => {
    if (!mapLoad || !map.current || !renderMarker || !places?.results ) return;
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    
    //render marker
    if (renderMarker) {
        places?.results.forEach((place, index) => {
            if (!map.current) return;
            
            if (index < 3) {
                const marker = new mapboxgl.Marker({color: '#FB7021'})
                    .setLngLat([place.location.lng, place.location.lat])
                    .addTo(map.current)

                markersRef.current.push(marker)
            } else {
                const marker = new mapboxgl.Marker()
                    .setLngLat([place.location.lng, place.location.lat])
                    .addTo(map.current)
                
                markersRef.current.push(marker)
            }
        })
    }
}, [mapLoad, renderMarker, places])

    if (!isClient) {
        return <div id="map" style={{ height: '100%' }}></div>;
    }
    
    if (mapError) {
        return (
            <div id="map" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0' }}>
                <p style={{ color: 'red' }}>{mapError}</p>
            </div>
        );
    }
    
    return <div id="map" ref={mapContainerRef} style={{ height: '100%' }}></div>;
};

export default Map;
