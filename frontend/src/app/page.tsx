"use client";

import React, { useEffect, useRef, useState } from "react";
import { SignedIn, SignedOut, SignIn, useUser } from "@clerk/nextjs";
import Map from "./components/Map";
import SearchPanel from "@/app/components/panel/SearchPanel";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import PopupContent from "@/app/components/panel/ui-components/PopupContent";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./profile/firebase/firebaseUtils";
import type { PlacesType, ResType } from "@/app/components/panel/SearchPanel";

export default function Home() {
  const { user } = useUser();
  const [places, setPlaces] = useState<ResType>();
  const [userCenter, setUserCenter] = useState<{ lat: number; lng: number }>({
    lat: 0,
    lng: 0,
  });
  const [radius, setRadius] = useState(500);
  const [keyword, setKeyword] = useState("");
  const [renderMarker, setRenderMarker] = useState(false);

  // Popup state
  const [showPopup, setShowPopup] = useState(false);
  const [popupId, setPopupId] = useState<string | null>(null);

  // Favorites and opt-outs state
  const [favorites, setFavorites] = useState<string[]>([]);
  const [optOuts, setOptOuts] = useState<string[]>([]);

  // Set the user's map center
  const setUserLocation = (lng: number, lat: number) => {
    setUserCenter({ lng, lat });
  };

  // Fetch places whenever location, radius, or keyword changes
  useEffect(() => {
    if (!userCenter) return;

    const fetchPlaces = async () => {
      const params = new URLSearchParams({
        lat: userCenter.lat.toString(),
        lng: userCenter.lng.toString(),
        radius: radius.toString(),
      });

      if (keyword) {
        params.append("keyword", keyword);
      }

      try {
        const res = await fetch("/api/places?" + params.toString());
        const data: ResType = await res.json();
        setPlaces(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchPlaces();
  }, [userCenter, radius, keyword]);

  // Load user preferences from Firestore when component mounts
  useEffect(() => {
    if (!user) return;

    const loadUserPreferences = async () => {
      const userDocRef = doc(db, "users", user.id);
      try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.favoriteList) setFavorites(data.favoriteList);
          if (data.optOutList) setOptOuts(data.optOutList);
        }
      } catch (error) {
        console.error("Error loading user preferences:", error);
      }
    };

    loadUserPreferences();
  }, [user]);

  // Save favorites & opt-outs back to Firestore
  const saveUserPreferences = async (
    newFavorites: string[],
    newOptOuts: string[]
  ) => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.id);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      await updateDoc(userDocRef, {
        favoriteList: newFavorites,
        optOutList: newOptOuts,
      });
    } else {
      await setDoc(userDocRef, {
        favoriteList: newFavorites,
        optOutList: newOptOuts,
      });
    }
  };

  const handleToggleFavorite = (placeId: string) => {
    let newFavorites: string[] = [];
    let newOptOuts = [...optOuts];

    if (favorites.includes(placeId)) {
      // If already a favorite, remove it
      newFavorites = favorites.filter((id) => id !== placeId);
    } else {
      // Otherwise add to favorites and remove from opt-outs
      newFavorites = [...favorites, placeId];
      newOptOuts = optOuts.filter((id) => id !== placeId);
    }

    setFavorites(newFavorites);
    setOptOuts(newOptOuts);
    saveUserPreferences(newFavorites, newOptOuts);
  };

  const handleToggleOptOut = (placeId: string) => {
    let newOptOuts: string[] = [];
    let newFavorites = [...favorites];

    if (optOuts.includes(placeId)) {
      // If already opted out, include again
      newOptOuts = optOuts.filter((id) => id !== placeId);
    } else {
      // Otherwise exclude and remove from favorites
      newOptOuts = [...optOuts, placeId];
      newFavorites = favorites.filter((id) => id !== placeId);
    }

    setOptOuts(newOptOuts);
    setFavorites(newFavorites);
    saveUserPreferences(newFavorites, newOptOuts);
  };

  const onKeywordChange = (value: string) => setKeyword(value);

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

          {/* Top-right Profile */}
          <div className="absolute top-4 right-4 z-30">
            <Link
              href="/profile"
              className="flex items-center gap-2 px-3 py-2 bg-orange-light text-white rounded"
            >
              Profile <UserButton />
            </Link>
          </div>

          {/* Popup floating on map */}
          {showPopup && popupId && (
            <div className="absolute top-10 left-1/3 ml-6 w-64 p-4 bg-default rounded-lg shadow-lg z-20">
              <PopupContent places={places!} popupId={popupId} />
            </div>
          )}
        </div>
      </SignedIn>
      <SignedOut>
        <div className="h-screen w-screen flex justify-center items-center">
          <SignIn routing="hash" />
        </div>
      </SignedOut>
    </>
  );
}
