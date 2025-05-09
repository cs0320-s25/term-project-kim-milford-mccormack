'use client';

import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import { useState } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user } = useUser();

  const [noiseLevel, setNoiseLevel] = useState('no preference');
  const [indoorOutdoor, setIndoorOutdoor] = useState('no preference');
  const [cozy, setCozy] = useState(false);
  const [modern, setModern] = useState(false);
  const [lightAndAiry, setLightAndAiry] = useState(false);
  const [academic, setAcademic] = useState(false);
  const [industrial, setIndustrial] = useState(false);
  const [optOutList, setOptOutList] = useState([
    'Super Awesome Cafe',
    'Very Good Park (no Kevin)'
  ]);
  const [favoriteList, setFavoriteList] = useState([
    'Evil Kevins House',
    'Suspicious Library (Kevin is there)'
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

          {/* Preferences Section */}
          <div className="mt-6">
            <p className="text-2xl font-bold mb-4">General Preferences</p>

            <div className="space-y-4">
              <div>
                <label className="block font-medium">Noise Level</label>
                <select
                    className="border p-2 rounded w-full"
                    value={noiseLevel}
                    onChange={(e) => setNoiseLevel(e.target.value)}
                >
                  <option value="no preference">No preference</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block font-medium">Indoors or Outdoors</label>
                <select
                    className="border p-2 rounded w-full"
                    value={indoorOutdoor}
                    onChange={(e) => setIndoorOutdoor(e.target.value)}
                >
                  <option value="no preference">No preference</option>
                  <option value="indoor">Indoor</option>
                  <option value="outdoor">Outdoor</option>
                  <option value="either">Either</option>
                </select>
              </div>
            </div>
          </div>

          {/* Vibes */}
          <div className="mt-6">
            <p className="text-2xl font-bold mb-4">Vibes</p>

            <div className="space-y-2">
              <div>
                <input
                    type="checkbox"
                    checked={cozy}
                    onChange={() => setCozy(!cozy)}
                    className="mr-2"
                />
                Cozy
              </div>
              <div>
                <input
                    type="checkbox"
                    checked={modern}
                    onChange={() => setModern(!modern)}
                    className="mr-2"
                />
                Modern
              </div>
              <div>
                <input
                    type="checkbox"
                    checked={lightAndAiry}
                    onChange={() => setLightAndAiry(!lightAndAiry)}
                    className="mr-2"
                />
                Light and airy
              </div>
              <div>
                <input
                    type="checkbox"
                    checked={academic}
                    onChange={() => setAcademic(!academic)}
                    className="mr-2"
                />
                Academic
              </div>
              <div>
                <input
                    type="checkbox"
                    checked={industrial}
                    onChange={() => setIndustrial(!industrial)}
                    className="mr-2"
                />
                Industrial
              </div>
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
                  // perform search
                }}
                className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-700 transition"
            >
              Set My Preferences and Search!
            </button>

            <button
                onClick={() => {
                  setNoiseLevel('no preference');
                  setIndoorOutdoor('no preference');
                  setCozy(false);
                  setLightAndAiry(false);
                  setModern(false);
                  setAcademic(false);
                  setIndustrial(false);
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
