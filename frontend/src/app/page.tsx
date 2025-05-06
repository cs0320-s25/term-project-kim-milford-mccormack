'use client';

import React, { useState } from 'react';
import Map from './components/Map';
import SearchPanel from '@/app/components/panel/SearchPanel';

export default function Home() {
    const googleMapsApiKey = process.env.NEXT_PUBLIC_PLACES_API_KEY;

    if (!googleMapsApiKey) {
        throw new Error("NEXT_PUBLIC_PLACES_API_KEY is not defined");
    }

    const mapCenter = { lat: 41.826664, lng: -71.402374 };
    const mapZoom = 18;

    // Popup state
    const [showPopup, setShowPopup] = useState(false);
    const [popupContent, setPopupContent] = useState<string | null>(null);

    return (
        <div className="flex h-screen relative">
            {/* Panel */}
            <div className="w-1/3 z-10">
                <SearchPanel
                    onCardClick={(content) => {
                        setPopupContent((prevContent) => {
                            // If already shown and same content, close it
                            if (showPopup && prevContent === content) {
                                setShowPopup(false);
                                return null;
                            }

                            // Otherwise show new content
                            setShowPopup(true);
                            return content;
                        });
                    }}
                />
            </div>

            {/* Map */}
            <div className="w-2/3">
                <Map apiKey={googleMapsApiKey} center={mapCenter} zoom={mapZoom} />
            </div>

            {/* Popup floating on map */}
            {showPopup && popupContent && (
                <div className="absolute top-10 left-1/3 ml-6 w-64 p-4 bg-white rounded-lg shadow-lg z-20">
                    <h3 className="font-semibold text-black">Details</h3>
                    <p className="text-sm text-gray-600">{popupContent}</p>
                </div>
            )}
        </div>
    );
}
