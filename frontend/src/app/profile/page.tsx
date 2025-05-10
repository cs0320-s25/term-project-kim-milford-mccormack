'use client';

import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import { useState } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user } = useUser();

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

  return (
      <div className="p-8 max-w-xl mx-auto relative">
        <SignedIn>
          <div className="flex flex-col items-center">
            <h1 className="text-5xl font-extrabold text-center mb-6">LoFi Profile</h1>

            <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonBox: "scale-150",
                  },
                }}
            />
          </div>

          <div className="mt-6">
            <p className="text-gray-600">
              Welcome, <strong>{user?.fullName}</strong>! What kind of study space are you looking for?
            </p>
          </div>

          {/* Vibes */}
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
            </div>
          </div>


          {/* Action Buttons */}
          <div className="flex flex-col items-center gap-2 mt-6">

            <button
                onClick={() => setShowPopup(true)}
                className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-700 transition"
            >
              View Favorited / Opted-Out Locations
            </button>

            <button
                onClick={() => {
                  // takes user back to the map page -> asks them to select a keyword(s), or simply search with their preferences.
                }}
                className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-700 transition"
            >
              Set My Preferences and Search!
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
                  setCowork(3)
                  setHasDrinks(3);
                  setHasFood(3)

                }}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-700 transition"
            >
              Reset My Preferences
            </button>


            <Link
                href="/"
                className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-700 transition"
            >
              ← Back to Map
            </Link>
          </div>

          {/* Popup Modal */}
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

                  <div className="mb-4">
                    <h3 className="font-semibold">Favorites:</h3>
                    {favoriteList.length === 0 ? (
                        <p className="text-sm text-gray-500">No favorites yet.</p>
                    ) : (
                        <ul className="list-disc pl-5">
                          {favoriteList.map((loc, idx) => (
                              <li key={idx} className="flex justify-between items-center">
                                {loc}
                                <button
                                    onClick={() => {
                                      setLastRemoved({ type: 'favorite', location: loc });
                                      setFavoriteList(favoriteList.filter((_, i) => i !== idx));
                                    }}
                                    className="text-red-500 hover:text-red-700 text-sm"
                                >
                                  Remove
                                </button>
                              </li>
                          ))}
                        </ul>
                    )}
                  </div>

                  <div className="mb-4">
                    <h3 className="font-semibold">Opted-Out:</h3>
                    {optOutList.length === 0 ? (
                        <p className="text-sm text-gray-500">No opt-outs yet.</p>
                    ) : (
                        <ul className="list-disc pl-5">
                          {optOutList.map((loc, idx) => (
                              <li key={idx} className="flex justify-between items-center">
                                {loc}
                                <button
                                    onClick={() => {
                                      setLastRemoved({ type: 'optOut', location: loc });
                                      setOptOutList(optOutList.filter((_, i) => i !== idx));
                                    }}
                                    className="text-red-500 hover:text-red-700 text-sm"
                                >
                                  Remove
                                </button>
                              </li>
                          ))}
                        </ul>
                    )}
                  </div>

                  {/* Undo Section */}
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
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                        >
                          Undo
                        </button>
                      </div>
                  )}
                </div>
              </div>
          )}
        </SignedIn>

        <SignedOut>
          <div className="text-center mt-20">
            <p>You must sign in to view your profile and access your preferences.</p>
          </div>
        </SignedOut>
      </div>
  );
}
