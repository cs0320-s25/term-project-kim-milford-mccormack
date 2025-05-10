'use client';

import React, {useState, useMemo, useEffect, Dispatch, SetStateAction} from "react";
import SearchBar from "@/app/components/panel/ui-components/SearchBar";
import FilterPanel from "@/app/components/panel/FilterPanel";
import { motion, AnimatePresence } from "framer-motion";
import {placesCategories} from "@/lib/constants";
import { ToggleButton } from "@mui/material";
import { CheckIcon } from "@heroicons/react/16/solid";
import { StarIcon } from '@heroicons/react/20/solid';


const phrases = [
  "Top study spots coming right up 📚✨",
  "Found your perfect place to focus 🎯📖",
  "Study-ready spots picked just for you 🧠💡",
  "Here’s where your brain will bloom 🌸📘",
  "Quiet corners and good vibes ahead 😌☕",
  "Your cozy study spot awaits you 🛋️📓",
  "Books out! Here’s your study haven 📝🌈",
  "Ace your exams from these spots 🧃🔥"
];

type Place = {
  name: string;
  address: string;
  location: {lat: number, lng: number};
  rating: number;
  open_now: boolean;
  description: string;
}

type SearchPanelProps = {
  onCardClick?: (content: string) => void;
  // places: Place[];
  onKeywordChange: (value: string) => void;
};

const SearchPanel = ({ onCardClick, onKeywordChange }: SearchPanelProps) => {
  const [message, setMessage] = useState("");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([]);
  const [randomFivePlaces, setRandomFivePlaces] = useState<string[]>([]);
  const [selected, setSelected] = useState(false);

  const toggleSelection = () => {
    setSelected(!selected);
    onCardClick?.('Extra information goes here.')
  }

  useEffect(() => {
    const shuffled = [...placesCategories].sort(() => 0.5 - Math.random());
    setRandomFivePlaces(shuffled.slice(0, 5));
  }, []);

  const filterSearch = () => {
    setShowFilterPanel(true);
  };

  const handlePlaceChange = (
      event: React.MouseEvent<HTMLElement>,
      place: string
  ) => {
    setSelectedPlaces((prevSelected) =>
        prevSelected.includes(place)
            ? prevSelected.filter((r) => r !== place)
            : [...prevSelected, place]
    );
  };

  return (
      <div className="flex flex-col gap-4 h-full w-full overflow-auto bg-default">
        <AnimatePresence mode="sync">
          {!showFilterPanel ? (
              <motion.div
                  key="search-view"
                  initial={{x: "-100%"}}
                  animate={{x: 0}}
                  exit={{x: "-100%"}}
                  transition={{duration: 0.2}}
                  className="flex flex-col gap-3 bg-default"
              >
                <SearchBar 
                    onFilter={filterSearch}
                    onKeywordChange={onKeywordChange}
                />
                {message && (
                    <div className="text-lg font-semibold text-black px-4">
                      {message}
                    </div>
                )}

                {/* recommendation */}
                <div className="flex flex-col gap-3 px-4">
                  <p className="font-semibold">Places</p>
                  <div className="flex flex-wrap gap-2">
                    {randomFivePlaces.map((place) => (
                        <ToggleButton
                            key={place}
                            value={place}
                            selected={selectedPlaces.includes(place)}
                            onChange={handlePlaceChange}
                            sx={{
                              borderRadius: '999px',
                              px: 2,
                              py: 0.5,
                              textTransform: 'capitalize',
                              border: '1px solid',
                              borderColor: selectedPlaces.includes(place) ? 'primary.main' : 'grey.400',
                              color: selectedPlaces.includes(place) ? 'primary.main' : 'text.primary',
                              backgroundColor: 'transparent',
                              '&.Mui-selected': {
                                backgroundColor: 'transparent',
                                color: 'primary.main',
                                borderColor: 'primary.main',
                              },
                              '&.Mui-selected:hover': {
                                backgroundColor: 'transparent',
                              },
                            }}
                        >
                          {selectedPlaces.includes(place) && (
                              <CheckIcon className="h-5 w-5 icon-black p-0"/>
                          )}
                          {place}
                        </ToggleButton>
                    ))}
                  </div>
                </div>

                {/*Card*/}
                <div className="relative w-full max-w-md">
                  <div
                      onClick={toggleSelection}
                      className={`cursor-pointer transition-colors duration-300 p-4 flex gap-4 ${
                          selected ? 'bg-gray' : 'bg-default'
                      }`}
                  >
                    {/* Image Placeholder */}
                    <div className="w-20 h-20 rounded-md bg-gray-300 flex-shrink-0"/>

                    {/* Content */}
                    <div className="flex flex-col justify-between">
                      <div>
                        <h2 className={`text-lg ${selected ? 'font-medium' : 'font-bold'}`}>Cafe Name</h2>

                        <div className="flex items-center gap-1 mt-1">
                          <p className="text-sm">4.0</p>
                          {[...Array(5)].map((_, i) => (
                              <StarIcon key={i} className="h-4 w-4 text-yellow-400"/>
                          ))}
                          <p className="text-sm text-gray-500">(36)</p>
                        </div>

                        <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">
                          Cafe / Restaurant · 1190 N Main St, Providence
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-sm mt-2">
                        <span className="text-green-600 font-medium">Open</span>
                        <span>·</span>
                        <span>Closes 10PM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
          ) : (
              <motion.div
                  key="filter-panel"
                  initial={{x: "100%"}}
                  animate={{x: 0}}
                  exit={{x: "100%"}}
                  transition={{duration: 0.2}}
                  className="bg-default"
              >
                <FilterPanel setShowFilterPanel={setShowFilterPanel}/>
              </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
};

export default SearchPanel;
