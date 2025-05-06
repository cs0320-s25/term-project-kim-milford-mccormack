'use client';

import React, { useEffect, useRef } from 'react';

interface GoogleMapProps {
  apiKey: string;
  center: { lat: number; lng: number };
  zoom: number;
}

const GoogleMapComponent: React.FC<GoogleMapProps> = ({ apiKey, center, zoom }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null); // track if map is initialized

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (typeof window.google === 'undefined') {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initMap;
        document.head.appendChild(script);
      } else {
        initMap();
      }
    };

    const initMap = () => {
      // return if map is initialized, prevent from re-rendering every time
      if (!mapRef.current || mapInstanceRef.current || !window.google) return;

      // Initialize the map only once
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center,
        zoom,
      });
    };

    loadGoogleMaps();
  }, [apiKey]);

  // Optional: update map center/zoom on prop change without recreating the map
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(center);
      mapInstanceRef.current.setZoom(zoom);
    }
  }, [center, zoom]);

  return <div ref={mapRef} className="w-full h-full" />;
};

export default GoogleMapComponent;
