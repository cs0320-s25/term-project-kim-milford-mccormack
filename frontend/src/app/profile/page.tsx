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

  return (
      <div className="p-8 max-w-xl mx-auto">
        <SignedIn>
          <div className="flex flex-col items-center">
            <h1 className="text-5xl font-extrabold text-center mb-6">LoFi Profile</h1>

            <UserButton afterSignOutUrl="/" appearance={{
              elements: {
                userButtonBox: "scale-150",
              }
            }}/>
          </div>


          <div className="mt-6">
            <p className="text-gray-600">Welcome, <strong>{user?.fullName}</strong>! What kind of study space are you looking for?</p>
          </div>


          {/* Preferences Section */}
          <div className="mt-6">
            <p className="text-2xl font-bold mb-4">General Preferences</p>
          </div>
          <div className="mt-2 space-y-4">
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

            <div className="mt-6">
              <p className="text-2xl font-bold mb-4">Vibes</p>
            </div>

            <div className="mt-2 space-y-2">

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

          <div className="flex flex-col items-center gap-1 mt-6">
            <button
                onClick={() => {
                  // conduct filtered search, go back to map
                }}
                className="inline-block mt-6 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-700 transition"            >
              Set My Preferences and Search!
            </button>

            <button
                onClick={() => {
                  setNoiseLevel('No preference');
                  setIndoorOutdoor('No preference');
                  setCozy(false);
                  setLightAndAiry(false);
                  setModern(false);
                  setAcademic(false);
                  setIndustrial(false);

                }}
                className="inline-block mt-6 px-4 py-2  bg-yellow-500 text-white rounded hover:bg-yellow-700 transition"            >
              Reset My Preferences
            </button>

            <Link href="/" className="inline-block mt-6 px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-700 transition">
              ← Back to Map
            </Link>
          </div>


        </SignedIn>

        <SignedOut>
          <div className="text-center mt-20">
            <p>You must sign in to view your profile and access your preferences.</p>
          </div>
        </SignedOut>
      </div>
  );
}
