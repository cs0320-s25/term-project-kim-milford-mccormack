'use client';

import React, {useEffect, useState} from 'react';
import { SignedIn, SignedOut, SignIn } from '@clerk/nextjs';
import Map from './components/Map';
import SearchPanel from '@/app/components/panel/SearchPanel';
import {func} from "prop-types";
import {UserButton} from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
    // const googleMapsApiKey = process.env.NEXT_PUBLIC_PLACES_API_KEY;
    const [places, setPlaces] = useState([]);
    const [userCenter, setUserCenter] = useState<{lat: number, lng: number}>({lat: 0, lng: 0});
    const [radius, setRadius] = useState(1000);
    const [keyword, setKeyword] = useState('');

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    setUserCenter({lat: position.coords.latitude, lng: position.coords.longitude});
                },
                error => {
                    console.error('Error getting location:', error);
                }
            );
        } else {
            console.error("Geolocation not supported");
        }
    }, []);


    useEffect(() => {
        if (!userCenter) return;

        const fetchPlaces = async() => {
            const params = new URLSearchParams({
                lat: userCenter.lat.toString(),
                lng: userCenter.lng.toString(),
                radius: radius.toString(),
            });


            if (keyword) {
                params.append('keyword', keyword);
            }

            try {
                const res = await fetch('/api/places?' + params.toString())
                const data = await res.json();
                setPlaces(data);
                console.log(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchPlaces();
    }, [userCenter, radius, keyword]);

    // if (!googleMapsApiKey) {
    //     throw new Error("NEXT_PUBLIC_PLACES_API_KEY is not defined");
    // }

    const mapZoom = 16;

    // Popup state
    const [showPopup, setShowPopup] = useState(false);
    const [popupContent, setPopupContent] = useState<string | null>(null);

    function onKeywordChange(value: string) {
        setKeyword(value);
    }

    return (
        <div className="flex h-screen relative">
            {/* Panel */}
            <SignedIn>
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
                />
            </div>

            {/* Map */}
            <div className="w-2/3">
                {/*<Map*/}
                {/*    apiKey={googleMapsApiKey}*/}
                {/*    zoom={mapZoom}*/}
                {/*    userCenter={userCenter} />*/}
            </div>

            <div className="absolute top-4 right-4 z-30 flex items-center gap-4">
                <Link href="/profile" className="inline-block px-4 py-1  font-bold text-1xl bg-gray-500 text-white  rounded hover:bg-gray-700 transition">Profile</Link>
                <UserButton />
            </div>

            {/* Popup floating on map */}
            {showPopup && popupContent && (
                <div className="absolute top-10 left-1/3 ml-6 w-64 p-4 bg-white rounded-lg shadow-lg z-20">
                    <h3 className="font-semibold text-black">Details</h3>
                    <p className="text-sm text-gray-600">{popupContent}</p>
                </div>
            )}
            </SignedIn>
        </div>
    );
}
