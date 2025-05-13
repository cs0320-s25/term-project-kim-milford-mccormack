'use client';

import { SignedIn, UserButton, useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase/firebaseUtils';

export default function ProfilePage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);

  const [quiet, setNoiseLevel] = useState(3);
  const [indoorOutdoor, setIndoorOutdoor] = useState(3);
  const [cozy, setCozy] = useState(3);
  const [modern, setModern] = useState(3);
  const [lightAndAiry, setLightAndAiry] = useState(3);
  const [academic, setAcademic] = useState(3);
  const [industrial, setIndustrial] = useState(3);
  const [cowork, setCowork] = useState(3);
  const [busy, setBusy] = useState(3);
  const [hasFood, setHasFood] = useState(3);
  const [hasDrinks, setHasDrinks] = useState(3);
  const [searchRadiusLevel, setSearchRadiusLevel] = useState(1);

  const radiusMap = {
    1: '0.5km',
    2: '1km',
    3: '1.5km',
    4: '2km'
  };

  const [optOutList, setOptOutList] = useState([
    'Example 1 hardcode',
    'Example 2 hardcode',
    'Kevin'
  ]);
  const [favoriteList, setFavoriteList] = useState([
    'Example 1 hardcode',
    'Example 2 hardcode'
  ]);
  const [showPopup, setShowPopup] = useState(false);
  const [lastRemoved, setLastRemoved] = useState<{
    type: 'favorite' | 'optOut';
    location: string;
  } | null>(null);

  const removeItem = async (listType: string, item: string) => {
    if (listType === 'favorite') {
      setFavoriteList((prev) => prev.filter(fav => fav !== item));
    } else {
      setOptOutList((prev) => prev.filter(optOut => optOut !== item));
    }
    setLastRemoved({ type: listType as 'favorite' | 'optOut', location: item });
    await saveUserPreferences();
  };

  const saveUserPreferences = async () => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.id);
    const preferences = {
      quiet,
      indoorOutdoor,
      cozy,
      modern,
      lightAndAiry,
      academic,
      industrial,
      cowork,
      busy,
      hasFood,
      hasDrinks,
      searchRadiusLevel,
      favoriteList,
      optOutList,
    };

    try {
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        await updateDoc(userDocRef, preferences);
      } else {
        await setDoc(userDocRef, preferences);
      }
      console.log('Saved preferences for', user.id);
    } catch (err) {
      console.error('Error saving preferences:', err);
    }
  };

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      const docRef = doc(db, 'users', user.id);
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setNoiseLevel(data.quiet ?? 3);
          setIndoorOutdoor(data.indoorOutdoor ?? 3);
          setCozy(data.cozy ?? 3);
          setModern(data.modern ?? 3);
          setLightAndAiry(data.lightAndAiry ?? 3);
          setAcademic(data.academic ?? 3);
          setIndustrial(data.industrial ?? 3);
          setCowork(data.cowork ?? 3);
          setBusy(data.busy ?? 3);
          setHasFood(data.hasFood ?? 3);
          setHasDrinks(data.hasDrinks ?? 3);
          setSearchRadiusLevel(data.searchRadiusLevel ?? 1);
          setFavoriteList(data.favoriteList ?? []);
          setOptOutList(data.optOutList ?? []);
          console.log('Loaded data:', data);
        } else {
          console.log('No preferences yet — using defaults.');
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (!user || loading) {
    return <div className="text-center p-8">Loading your profile...</div>;
  }

  return (
      <div className="p-8 max-w-xl mx-auto relative">
        <SignedIn>
          <div className="flex flex-col items-center">
            <h1 className="text-5xl font-extrabold text-center mb-6">LoFi Profile</h1>
            <UserButton
                afterSignOutUrl="/"
                appearance={{ elements: { userButtonBox: 'scale-150' } }}
            />
          </div>

          <div className="mt-6">
            <p className="text-gray-600">
              Welcome, <strong>{user?.fullName}</strong>! What kind of study space are you looking for?
            </p>
          </div>

          <div className="mt-6">
            <p className="text-2xl font-bold mb-4">Set your preferences here!</p>

            <div className="space-y-6">
              {[
                { label: 'Quiet', state: quiet, setter: setNoiseLevel },
                { label: 'Outdoors', state: indoorOutdoor, setter: setIndoorOutdoor },
                { label: 'Cozy', state: cozy, setter: setCozy },
                { label: 'Busy', state: busy, setter: setBusy },
                { label: 'Modern', state: modern, setter: setModern },
                { label: 'Light and airy', state: lightAndAiry, setter: setLightAndAiry },
                { label: 'Academic', state: academic, setter: setAcademic },
                { label: 'Industrial', state: industrial, setter: setIndustrial },
                { label: 'Coworking environment', state: cowork, setter: setCowork },
                { label: 'Has food', state: hasFood, setter: setHasFood },
                { label: 'Has drinks', state: hasDrinks, setter: setHasDrinks },
              ].map(({ label, state, setter }) => (
                  <div key={label}>
                    <label className="block font-medium mb-1">{label}</label>
                    <input
                        type="range"
                        min={1}
                        max={5}
                        step={1}
                        value={state}
                        onChange={(e) => setter(Number(e.target.value))}
                        className="w-full accent-gray-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Absolutely not</span>
                      <span>Neutral</span>
                      <span>Yes please!</span>
                    </div>
                  </div>
              ))}

              <div>
                <label className="block font-medium mb-1">Search radius</label>
                <input
                    type="range"
                    min={1}
                    max={4}
                    step={1}
                    value={searchRadiusLevel}
                    onChange={(e) => setSearchRadiusLevel(Number(e.target.value))}
                    className="w-full accent-gray-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>.5km</span>
                  <span>1km</span>
                  <span>1.5km</span>
                  <span>2km</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 mt-6">
            <button
                onClick={() => setShowPopup(true)}
                className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-700 transition"
            >
              View Favorited / Opted-Out Locations
            </button>

            <button
                onClick={() => {
                  setNoiseLevel(3);
                  setIndoorOutdoor(3);
                  setCozy(3);
                  setLightAndAiry(3);
                  setModern(3);
                  setAcademic(3);
                  setIndustrial(3);
                  setBusy(3);
                  setCowork(3);
                  setHasDrinks(3);
                  setHasFood(3);
                  setSearchRadiusLevel(1);
                }}
                className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-700 transition"
            >
              Reset My Preferences to Default
            </button>

          </div>

          <div className="flex flex-col items-center gap-5 mt-6">
          <button
                onClick={async () => {
                  await saveUserPreferences();
                }}
                className="bg-teal-400 hover:bg-teal-700 text-white font-extrabold py-5 px-10 text-xl rounded-xl shadow-lg transition-all transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-teal-300"
            >
              Set My Preferences!
            </button>
          </div>

          <div className="flex flex-col items-center gap-2 mt-6">
            <Link
                href="/"
                className="px-2 py-1 bg-indigo-500 text-sm text-white rounded hover:bg-indigo-700 transition"
            >
              ← Back to Map
            </Link>
          </div>

          {showPopup && (
              <div className="fixed inset-0 bg-gray bg-opacity-20 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg w-[90%] max-w-md relative">
                  <button
                      onClick={() => setShowPopup(false)}
                      className="absolute top-2 right-2 text-gray-500 hover:text-black"
                  >
                    ✕
                  </button>

                  <h2 className="text-2xl font-bold mb-4">Your Lists</h2>

                  <div>
                    <h3 className="text-lg font-bold mb-2">Favorites</h3>
                    {favoriteList.length > 0 ? (
                        favoriteList.map(item => (
                            <div key={item} className="flex justify-between items-center mb-1">
                              <span>{item}</span>
                              <button onClick={() => removeItem('favorite', item)} className="text-red-500">Remove</button>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 italic">No favorites added.</p>
                    )}

                    <h3 className="text-lg font-bold mt-4 mb-2">Opt-Outs</h3>
                    {optOutList.length > 0 ? (
                        optOutList.map(item => (
                            <div key={item} className="flex justify-between items-center mb-1">
                              <span>{item}</span>
                              <button onClick={() => removeItem('optOut', item)} className="text-red-500">Remove</button>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 italic">No locations opted out.</p>
                    )}
                  </div>

                  {lastRemoved && (
                      <div className="mt-4 text-center">
                        <p className="mb-2 text-gray-700">
                          Removed <strong>{lastRemoved.location}</strong> from{' '}
                          {lastRemoved.type === 'favorite' ? 'Favorites' : 'Opt-Outs'}.
                        </p>
                        <button
                            onClick={() => {
                              if (lastRemoved.type === 'favorite') {
                                setFavoriteList([...favoriteList, lastRemoved.location]);
                              } else {
                                setOptOutList([...optOutList, lastRemoved.location]);
                              }
                              setLastRemoved(null);
                            }}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-700 transition"
                        >
                          Undo
                        </button>
                      </div>
                  )}
                </div>
              </div>
          )}
        </SignedIn>
      </div>
  );
}
