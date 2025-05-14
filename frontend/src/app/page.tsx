'use client';

import React, {useEffect, useRef, useState} from 'react';
import { SignedIn, SignedOut, SignIn, useUser } from '@clerk/nextjs';
import Map from './components/Map';
import SearchPanel from '@/app/components/panel/SearchPanel';
import {func} from "prop-types";
import {UserButton} from "@clerk/nextjs";
import Link from "next/link";
import PopupContent from "@/app/components/panel/ui-components/PopupContent";
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './profile/firebase/firebaseUtils'; // Adjust this import to your project structure
import PlacesType from '@/app/components/panel/SearchPanel'


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
    const { user } = useUser();
    const [places, setPlaces] = useState<ResType | undefined>(undefined);
    const [userCenter, setUserCenter] = useState<{ lat: number, lng: number }>({lat: 0, lng: 0});
    const [radius, setRadius] = useState(500);
    const [keyword, setKeyword] = useState('');
    const [renderMarker, setRenderMarker] = useState(false);
    // Popup state
    const [showPopup, setShowPopup] = useState(false);
    const [popupContent, setPopupContent] = useState<string | null>(null);
    const [popupId, setPopupId] = useState<string | null>(null);
    // Favorites and opt-outs state

    const [favorites, setFavorites] = useState<string[]>([]);
    const [optOuts, setOptOuts] = useState<string[]>([]);

    console.log(popupId)

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

    // Load user preferences from Firestore when component mounts
    useEffect(() => {
        if (!user) return;

        const loadUserPreferences = async () => {
            const userDocRef = doc(db, 'users', user.id);
            try {
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    // Load favorites and opt-outs if they exist
                    if (data.favoriteList) setFavorites(data.favoriteList);
                    if (data.optOutList) setOptOuts(data.optOutList);
                }
            } catch (error) {
                console.error('Error loading user preferences:', error);
            }
        };

        loadUserPreferences();
    }, [user]);

    // Save favorites and opt-outs to Firestore
    const saveUserPreferences = async () => {
        if (!user) return;

        const userDocRef = doc(db, 'users', user.id);
        try {
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
                // Update existing document
                await updateDoc(userDocRef, {
                    favoriteList: favorites,
                    optOutList: optOuts
                });
            } else {
                // Create new document
                await setDoc(userDocRef, {
                    favoriteList: favorites,
                    optOutList: optOuts
                });
            }
            console.log('Saved user preferences');
        } catch (error) {
            console.error('Error saving user preferences:', error);
        }
    };

    const handleToggleFavorite = (placeId: string) => {
        setFavorites(prevFavorites => {
            const isFavorite = prevFavorites.includes(placeId);
            const newFavorites = isFavorite
                ? prevFavorites.filter(id => id !== placeId)
                : [...prevFavorites, placeId];

            if (!isFavorite) {
                setOptOuts(prev => prev.filter(id => id !== placeId));
            }

            setTimeout(() => saveUserPreferences(), 0);
            return newFavorites;
        });
    };


    const handleToggleOptOut = (placeId: string) => {
        setOptOuts(prevOptOuts => {
            const isOptedOut = prevOptOuts.includes(placeId);
            const newOptOuts = isOptedOut
                ? prevOptOuts.filter(id => id !== placeId)
                : [...prevOptOuts, placeId];

            // Remove from favorites if opted out
            if (!isOptedOut) {
                setFavorites(prev => prev.filter(id => id !== placeId));
            }

            setTimeout(() => saveUserPreferences(), 0);
            return newOptOuts;
        });
    };


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
                            setShowPopup={setShowPopup}
                            setPopupId={setPopupId}
                            onKeywordChange={onKeywordChange}
                            places={places}
                            renderMarker={renderMarker}
                            setRenderMarker={setRenderMarker}
                            favorites={favorites}
                            optOuts={optOuts}
                            onToggleFavorite={handleToggleFavorite}
                            onToggleOptOut={handleToggleOptOut}
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
                    {showPopup && popupId && (
                        <div
                            className="absolute top-10 left-1/3 ml-6 w-64 p-4 bg-default rounded-lg shadow-lg z-20">
                            <p className="text-sm text-secondary">{places?.results.map((place) => (
                                (place.name + place.address) == popupId
                                    ? <PopupContent places={places} popupId={popupId} />
                                    : null
                            ))}</p>
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