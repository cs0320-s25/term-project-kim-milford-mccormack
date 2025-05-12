'use client';

import React, {useEffect, useRef, useState} from 'react';
import { SignedIn, SignedOut, SignIn } from '@clerk/nextjs';
import Map from './components/Map';
import SearchPanel from '@/app/components/panel/SearchPanel';
import {func} from "prop-types";
import {UserButton} from "@clerk/nextjs";
import Link from "next/link";

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

export default function Home() {
    const [places, setPlaces] = useState<ResType | undefined>(undefined);
    const [userCenter, setUserCenter] = useState<{ lat: number, lng: number }>({lat: 0, lng: 0});
    const [radius, setRadius] = useState(1000);
    const [keyword, setKeyword] = useState('');
    const [renderMarker, setRenderMarker] = useState(false);
    
    const setUserLocation = (lng: number, lat: number) => {
        setUserCenter({lng, lat});
    }

    useEffect(() => {
        if (!userCenter) return;

        const fetchPlaces = async () => {
            const params = new URLSearchParams({
                lat: userCenter.lat.toString(),
                lng: userCenter.lng.toString(),
                radius: radius.toString(),
            });
            
            console.log(userCenter);
            
            if (keyword) {
                params.append('keyword', keyword);
            }

            console.log(params.toString());
            
            try {
                const res = await fetch('/api/places?' + params.toString())
                const data = await res.json();
                setPlaces(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchPlaces();
    }, [userCenter, radius, keyword]);
    
    //debugging purpose
    // useEffect(() => {
    //     console.log(places);
    // }, [places]);

    // Popup state
    const [showPopup, setShowPopup] = useState(false);
    const [popupContent, setPopupContent] = useState<string | null>(null);

    function onKeywordChange(value: string) {
        setKeyword(value);
    }

    return (
        <>
            <SignedIn>
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
                            onKeywordChange={onKeywordChange}
                            places={places}
                            setRenderMarker={setRenderMarker}
                        />
                    </div>

            {/* Map */}
            <div className="w-2/3">
                <Map
                    setUserLocation={setUserLocation}
                    renderMarker={renderMarker}
                    places={places}
                />
            </div>

                {/* Top-right buttons */}
                <div
                    className="group absolute top-4 right-4 z-30">
                    <Link
                        href="/profile"
                        className="flex items-center bg-orange-light text-white
                     font-bold text-1xl rounded justify-center gap-2 px-3 py-2 transition"
                    >
                        Profile
                        <UserButton/>
                    </Link>
                    
                </div>

                {/* Popup floating on map */}
                {showPopup && popupContent && (
                    <div
                        className="absolute top-10 left-1/3 ml-6 w-64 p-4 bg-default rounded-lg shadow-lg z-20">
                        <h3 className="font-semibold text-primary">Details</h3>
                        <p className="text-sm text-secondary">{popupContent}</p>
                    </div>
                )}
                </div>
            </SignedIn>

            <SignedOut>
                <div className="h-screen w-screen flex justify-center items-center">
                    <SignIn routing="hash"/>
                </div>
            </SignedOut>
        </>
    );
}
