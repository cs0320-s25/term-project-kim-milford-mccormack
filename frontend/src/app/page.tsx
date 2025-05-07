'use client';

import { SignedIn, SignedOut, SignIn } from '@clerk/nextjs';
import Map from './components/Map';
import SearchPanel from '@/app/components/panel/SearchPanel';
import React, { useState } from 'react';

export default function Home() {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_PLACES_API_KEY;
  if (!googleMapsApiKey) throw new Error("NEXT_PUBLIC_PLACES_API_KEY is not defined");

  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState<string | null>(null);

  return (
      <div className="flex h-screen relative">
        <SignedIn>
          <div className="w-1/3 z-10">
            <SearchPanel
                onCardClick={(content) => {
                  setPopupContent((prev) => {
                    if (showPopup && prev === content) {
                      setShowPopup(false);
                      return null;
                    }
                    setShowPopup(true);
                    return content;
                  });
                }}
            />
          </div>

          <div className="w-2/3">
            <Map apiKey={googleMapsApiKey} zoom={16} />
          </div>

          {showPopup && popupContent && (
              <div className="absolute top-10 left-1/3 ml-6 w-64 p-4 bg-white rounded-lg shadow-lg z-20">
                <h3 className="font-semibold text-black">Details</h3>
                <p className="text-sm text-gray-600">{popupContent}</p>
              </div>
          )}
        </SignedIn>

        <SignedOut>
          <div className="w-full flex items-center justify-center">
            <SignIn routing="hash" />
          </div>
        </SignedOut>
      </div>
  );
}
