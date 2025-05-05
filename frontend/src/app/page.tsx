'use client';

import React from 'react';
import Map from './components/Map';
import SearchPanel from '@/app/components/panel/SearchPanel';

export default function Home() {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_PLACES_API_KEY;

    if (!googleMapsApiKey) {
        throw new Error("NEXT_PUBLIC_PLACES_API_KEY is not defined");
    }

  const mapCenter = { lat: 41.826664, lng: -71.402374 }; // Example: New York City
  const mapZoom = 18;

  return (
      <div className="flex h-screen">

        <div className={"w-1/3"}>
          <SearchPanel />
        </div>
        <div className={"w-2/3"}>
          <Map apiKey={googleMapsApiKey} center={mapCenter} zoom={mapZoom} />
        </div>
      </div>
  );
}
