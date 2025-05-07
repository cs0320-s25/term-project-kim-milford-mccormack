'use client';

import React, {Dispatch, useEffect, useRef, useState} from 'react';

interface GoogleMapProps {
  apiKey: string;
  zoom: number;
  userCenter: {lat: number; lng: number};
  setUserCenter?: Dispatch<React.SetStateAction<{ lat: number, lng: number }>>;
}

const GoogleMapComponent: React.FC<GoogleMapProps> = ({ apiKey, zoom, userCenter, setUserCenter }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  // const [userCenter, setUserCenter] = useState<{ lat: number; lng: number } | null>(null);

  // Load Google Maps API
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
      if (!mapRef.current || mapInstanceRef.current || !window.google || !userCenter) return;

      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: userCenter,
        zoom,
        fullscreenControl: false,
        mapTypeControl: false,
        streetViewControl: false
      });

      // Optional: Add marker at user location
      new window.google.maps.Marker({
        position: userCenter,
        map: mapInstanceRef.current,
        title: "You are here"
      });
    };

    loadGoogleMaps();
  }, [apiKey, userCenter]);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
          position => {
            if (setUserCenter) {
              setUserCenter({
                lat: position.coords.latitude,
                lng: position.coords.longitude
              });
            }
          },
          error => {
            console.error('Error getting location:', error);
          }
      );
    } else {
      console.error('Geolocation not supported');
    }
  }, []);

  return <div ref={mapRef} className="w-full h-full" />;
};

export default GoogleMapComponent;
