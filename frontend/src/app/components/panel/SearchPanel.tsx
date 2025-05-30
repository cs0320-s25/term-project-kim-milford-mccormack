'use client';

import React, {useState, useEffect, Dispatch, SetStateAction} from "react";
import SearchBar from "@/app/components/panel/ui-components/SearchBar";
import FilterPanel from "@/app/components/panel/FilterPanel";
import { motion, AnimatePresence } from "framer-motion";
import {placesCategories} from "@/lib/constants";
import { ToggleButton } from "@mui/material";
import { CheckIcon } from "@heroicons/react/16/solid";
import { StarIcon, HeartIcon, EyeSlashIcon } from '@heroicons/react/20/solid';
import {onSnapshot} from "@firebase/firestore";
import {doc} from "firebase/firestore";
import {db} from "@/app/profile/firebase/firebaseUtils";

const phrases = [
  "Top study spots coming right up 📚✨",
  "Found your perfect place to focus 🎯📖",
  "Study-ready spots picked just for you 🧠💡",
  "Here's where your brain will bloom 🌸📘",
  "Quiet corners and good vibes ahead 😌☕",
  "Your cozy study spot awaits you 🛋️📓",
  "Books out! Here's your study haven 📝🌈",
  "Ace your exams from these spots 🧃🔥"
];

const StarRating = ({ rating }: { rating: number }) => {
  // Round to nearest half star
  const roundedRating = Math.round(rating * 2) / 2; // This rounds the rating to the nearest 0.5

  const fullStars = Math.floor(roundedRating); // Full stars (integer part)
  const hasHalfStar = roundedRating % 1 >= 0.5; // Check if there's a half star
  const emptyStars = 5 - Math.ceil(roundedRating); // Empty stars to complete the 5 stars

  return (
      <div className="flex items-center gap-1">
        {/* Full stars */}
        {[...Array(fullStars)].map((_, index) => (
            <StarIcon key={`full-${index}`} className="h-5 w-5 icon-orange-main" />
        ))}

        {/* Half star */}
        {hasHalfStar && (
            <div className="relative w-5 h-5">
              {/* Base: Gray star */}
              <StarIcon className="h-5 w-5 icon-grey-400 absolute left-0 top-0" />

              {/* Overlay: Yellow left half */}
              <div
                  className="absolute left-0 top-0 overflow-hidden"
                  style={{ width: '50%' }}
              >
                <StarIcon className="h-5 w-5 icon-orange-main" />
              </div>
            </div>
        )}

        {/* Empty stars */}
        {[...Array(emptyStars)].map((_, index) => (
            <StarIcon key={`empty-${index}`} className="h-5 w-5 icon-grey-400" />
        ))}
      </div>
  );
};

export type PlacesType = {
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

type SearchPanelProps = {
  setShowPopup: Dispatch<SetStateAction<boolean>>;
  setPopupId: Dispatch<SetStateAction<string | null>>;
  onKeywordChange: (value: string) => void;
  places: ResType | undefined;
  renderMarker: boolean;
  setRenderMarker: React.Dispatch<SetStateAction<boolean>>;
  favorites: string[];
  optOuts: string[];
  onToggleFavorite: (placeId: string) => void;
  onToggleOptOut: (placeId: string) => void;
};


const SearchPanel = ({
                       setShowPopup,
                       setPopupId,
                       onKeywordChange,
                       places,
                       renderMarker,
                       setRenderMarker,
                       favorites,
                       optOuts,
                       onToggleFavorite,
                       onToggleOptOut
                     }: SearchPanelProps) => {
  const [message, setMessage] = useState("");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([]);
  const [randomFivePlaces, setRandomFivePlaces] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  const togglePopup = (cardId: string) => {
    if (selected == null) {
      setShowPopup(false);
    }

    if (selected == cardId) {
      setShowPopup(true);
      setPopupId(cardId);
    } else {
      setSelected(cardId);
      setShowPopup(true);
      setPopupId(cardId);
    }
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


  // Function to filter and sort places based on selected categories
  const getFilteredAndSortedPlaces = () => {
    if (!places?.results) return [];

    let filteredPlaces = [...places.results];

    // Filter by selected categories if any are selected
    if (selectedPlaces.length > 0) {
      filteredPlaces = filteredPlaces.filter(place => {
        // Check if the place name or description contains any of the selected category keywords
        const placeText = (place.name + ' ' + place.description).toLowerCase();
        return selectedPlaces.some(category => {
          // Remove emoji and convert to lowercase for comparison
          const categoryKeyword = category.replace(/[^\w\s]/g, '').toLowerCase();
          return placeText.includes(categoryKeyword);
        });
      });
    }

    // Filter out any opted-out places
    filteredPlaces = filteredPlaces.filter(place => {
      //const placeId = place.name + place.address;
      return !optOuts.includes(place.name);
    });

    // Sort by rating (highest first)
    return filteredPlaces.sort((a, b) => b.rating - a.rating);
  };

  const handleFavoriteClick = (e: React.MouseEvent, placeId: string, ) => {
    e.stopPropagation();
    onToggleFavorite(placeId);
  };

  const handleOptOutClick = (e: React.MouseEvent, placeId: string) => {
    e.stopPropagation();
    onToggleOptOut(placeId);
  };

  return (
      <div className="flex flex-col h-full w-full overflow-auto bg-default">
        <div>
            <h1 className="text-5xl font-bold text-gray-900 flex flex-col items-center gap-1 p-4">
            LoFi</h1>
        <h2 className="text-1xl font-bold text-gray-900 flex flex-col items-center gap-3 p-1">Map, Search, and Filter</h2>
        </div>
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
                    setRenderMarker={setRenderMarker}
                />
                {message && (
                    <div className="text-lg font-semibold text-primary px-4">
                      {message}
                    </div>
                )}

                {/* recommendation */}
                <div className="flex flex-col gap-3 p-4">
                  <p className="font-semibold">What kind of study/work space would you like today?</p>
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

                <div className={"flex flex-col"}>
                  {/*Card*/}
                  {getFilteredAndSortedPlaces().map((place, index) => {
                    const placeId = place.name + ', '+ place.address;
                    const isFavorite = favorites.includes(placeId);
                    const isOptOut: boolean = optOuts.includes(placeId);

                    return (
                        <div key={placeId} className="relative w-full max-w-md">
                          <div
                              onClick={() => togglePopup(placeId)}
                              className={`cursor-pointer transition-colors duration-300 p-4 flex gap-4 border-b border-grey ${
                                  renderMarker
                                      ? index < 3
                                          ? selected == placeId
                                              ? 'bg-orange-main'
                                              : 'bg-orange-light'
                                          : selected == placeId
                                              ? 'bg-secondary'
                                              : 'bg-default'
                                      : selected == placeId
                                          ? 'bg-secondary'
                                          : 'bg-default'
                              }`}
                          >
                            {/* Image Placeholder */}
                            {/*<div className="w-20 h-20 rounded-md bg-secondary flex-shrink-0"/>*/}

                            {/* Content */}
                            <div className="flex flex-col justify-between w-full">
                              <div>
                                <div className="flex justify-between items-start">
                                  <h2 className={`text-lg ${selected ? 'font-medium' : 'font-bold'}`}>{place.name}</h2>
                                  <div className="flex space-x-2">
                                    {/* Favorite button */}
                                    <button
                                        onClick={(e) => handleFavoriteClick(e, placeId)}
                                        className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                                    >
                                      <HeartIcon
                                          className={`h-5 w-5 ${isFavorite ? 'text-red-600 fill-red-600' : 'text-gray-400'}`}
                                      />
                                    </button>

                                    {/* Opt-out button */}
                                    <button
                                        onClick={(e) => handleOptOutClick(e, placeId)}
                                        className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                                    >
                                      <EyeSlashIcon
                                          className={`h-5 w-5 ${isOptOut ? 'text-blue-600' : 'text-gray-400'}`}
                                      />
                                    </button>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 mt-1">
                                  <p className="text-sm">{place.rating}</p>
                                  <StarRating rating={place.rating} />
                                  <p className="text-sm text-secondary">(36)</p>
                                </div>

                                <p className="text-sm mt-1 text-secondary">
                                  {place.address}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 text-sm mt-2">
                                <span className="text-success font-medium">{place.open_now ? "Open" : "Closed"}</span>
                                <span>·</span>
                                <span>Closes 10PM</span>
                              </div>
                            </div>
                          </div>
                        </div>
                    );
                  })}
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