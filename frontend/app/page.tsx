// page.tsx
'use client'

import React from 'react';
import Map from '../components/Map';
import SearchPanel from '../components/SearchPanel';


const Page = () => {

  const googleMapsApiKey = process.env.NEXT_PUBLIC_PLACES_API_KEY;

  const mapCenter = { lat: 41.826664, lng: -71.402374 }; // Example: New York City
  const mapZoom = 18;

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '30%', paddingLeft: '20px' }}>
        <SearchPanel />
      </div>
      <div style={{ width: '70%' }}>
        <Map apiKey={googleMapsApiKey} center={mapCenter} zoom={mapZoom} />
      </div>
    </div>
  );
};

export default Page;