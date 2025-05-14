"use client";

import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import SearchBar from "@/app/components/panel/ui-components/SearchBar";
import FilterPanel from "@/app/components/panel/FilterPanel";
import { motion, AnimatePresence } from "framer-motion";
import { placesCategories } from "@/lib/constants";
import { ToggleButton } from "@mui/material";
import {
  CheckIcon,
  StarIcon,
  HeartIcon,
  EyeSlashIcon,
} from "@heroicons/react/20/solid";

export type PlacesType = {
  name: string;
  address: string;
  location: { lat: number; lng: number };
  rating: number;
  total_ratings: number;
  open_now: boolean;
  description: string;
};

export type ResType = {
  results: PlacesType[];
};

type SearchPanelProps = {
  setShowPopup: Dispatch<SetStateAction<boolean>>;
  setPopupId: Dispatch<SetStateAction<string | null>>;
  onKeywordChange: (value: string) => void;
  places: ResType | undefined;
  renderMarker: boolean;
  setRenderMarker: Dispatch<SetStateAction<boolean>>;
  favorites: string[];
  optOuts: string[];
  onToggleFavorite: (id: string) => void;
  onToggleOptOut: (id: string) => void;
};

const StarRating = ({ rating }: { rating: number }) => {
  // Wrap stars in a single container with an aria-label, hide icons from AT
  const rounded = Math.round(rating * 2) / 2;
  const full = Math.floor(rounded);
  const half = rounded % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <div
      className="flex items-center gap-1"
      aria-label={`Rating: ${rating} out of 5`}
    >
      {[...Array(full)].map((_, i) => (
        <StarIcon
          key={`full-${i}`}
          className="h-5 w-5 icon-orange-main"
          aria-hidden="true"
        />
      ))}
      {half && (
        <StarIcon
          key="half"
          className="h-5 w-5 icon-orange-main opacity-50"
          aria-hidden="true"
        />
      )}
      {[...Array(empty)].map((_, i) => (
        <StarIcon
          key={`empty-${i}`}
          className="h-5 w-5 icon-blue-400"
          aria-hidden="true"
        />
      ))}
    </div>
  );
};

export default function SearchPanel({
  setShowPopup,
  setPopupId,
  onKeywordChange,
  places,
  renderMarker,
  setRenderMarker,
  favorites,
  optOuts,
  onToggleFavorite,
  onToggleOptOut,
}: SearchPanelProps) {
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([]);
  const [randomFivePlaces, setRandomFivePlaces] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Shuffle five recommendation categories once
  useEffect(() => {
    setRandomFivePlaces(
      [...placesCategories].sort(() => 0.5 - Math.random()).slice(0, 5)
    );
  }, []);

  // Filter & sort logic unchanged
  const getFilteredAndSortedPlaces = () => {
    if (!places?.results) return [];
    let list = [...places.results];

    if (selectedPlaces.length) {
      list = list.filter((p) =>
        selectedPlaces.some((cat) =>
          (p.name + " " + p.description)
            .toLowerCase()
            .includes(cat.toLowerCase())
        )
      );
    }

    list = list.filter((p) => !optOuts.includes(p.name + p.address));
    return list.sort((a, b) => b.rating - a.rating);
  };

  const openPopup = (id: string) => {
    setSelectedId(id);
    setShowPopup(true);
    setPopupId(id);
  };

  return (
    <div
      className="flex flex-col h-full w-full overflow-auto bg-default"
      role="region"
      aria-label="Search results"
    >
      {/* Header */}
      <div className="p-4 flex flex-col items-center gap-1">
        <h1 className="text-3xl font-bold">LoFi</h1>
        <h2 className="text-xl">Map, Search & Filter</h2>
      </div>

      <AnimatePresence mode="sync">
        {/* === RESULTS + SEARCH BAR VIEW === */}
        {!showFilterPanel ? (
          <motion.div
            key="results"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-3"
          >
            {/* Search input + filter button */}
            <SearchBar
              onKeywordChange={onKeywordChange}
              onFilter={() => setShowFilterPanel(true)}
              setRenderMarker={setRenderMarker}
            />

            {/* Recommendations */}
            <div
              role="region"
              aria-label="Recommended categories"
              className="flex flex-wrap gap-2 p-4 "
            >
              {randomFivePlaces.map((cat) => (
                <ToggleButton
                  key={cat}
                  value={cat}
                  selected={selectedPlaces.includes(cat)}
                  onChange={(_, v) =>
                    v !== null &&
                    setSelectedPlaces((prev) =>
                      prev.includes(v)
                        ? prev.filter((x) => x !== v)
                        : [...prev, v]
                    )
                  }
                  aria-label={`Toggle recommendation: ${cat}`}
                  className={`rounded-full px-4 py-2 border focus:outline focus:outline-2 focus:outline-blue-500`}
                >
                  {selectedPlaces.includes(cat) && (
                    <CheckIcon
                      aria-hidden="true"
                      className="h-5 w-5 icon-blue"
                    />
                  )}
                  {cat}
                </ToggleButton>
              ))}
            </div>

            {/* Place cards */}
            {getFilteredAndSortedPlaces().map((place, idx) => {
              const id = place.name + place.address;
              const isFav = favorites.includes(id);
              const isOut = optOuts.includes(id);

              // background logic unchanged
              const bgClass = renderMarker
                ? idx < 3
                  ? selectedId === id
                    ? "bg-orange-main"
                    : "bg-orange-light"
                  : selectedId === id
                  ? "bg-secondary"
                  : "bg-default"
                : selectedId === id
                ? "bg-secondary"
                : "bg-default";

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => openPopup(id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openPopup(id);
                    }
                  }}
                  className={`relative w-full max-w-md text-left transition-colors duration-300 p-4 flex gap-4 border-b border-blue-500 ${bgClass}`}
                >
                  <div className="flex flex-col justify-between w-full">
                    {/* Title + actions */}
                    <div className="flex justify-between items-start">
                      <h3
                        className={`text-lg ${
                          selectedId === id ? "font-medium" : "font-bold"
                        }`}
                      >
                        {place.name}
                      </h3>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(id);
                          }}
                          aria-pressed={isFav}
                          aria-label={
                            isFav ? "Remove favorite" : "Add favorite"
                          }
                          className="p-1 rounded-full focus:outline focus:outline-offset-2 focus:outline-blue-500"
                        >
                          <HeartIcon
                            aria-hidden="true"
                            className={`h-5 w-5 ${
                              isFav ? "text-red-600" : "text-gray-400"
                            }`}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleOptOut(id);
                          }}
                          aria-pressed={isOut}
                          aria-label={isOut ? "Include place" : "Exclude place"}
                          className="p-1 rounded-full focus:outline focus:outline-offset-2 focus:outline-blue-500"
                        >
                          <EyeSlashIcon
                            aria-hidden="true"
                            className={`h-5 w-5 ${
                              isOut ? "text-blue-600" : "text-gray-400"
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="sr-only">Rating:</span>
                      <p className="text-sm">{place.rating}</p>
                      <StarRating rating={place.rating} />
                      <span className="text-sm text-secondary">
                        ({place.total_ratings})
                      </span>
                    </div>

                    {/* Address */}
                    <p className="text-sm mt-1 text-secondary">
                      {place.address}
                    </p>

                    {/* Open/Closed */}
                    <div className="flex items-center gap-2 text-sm mt-2">
                      <span className="text-success font-medium">
                        {place.open_now ? "Open now" : "Closed"}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Closes 10 PM</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </motion.div>
        ) : (
          /* === FILTER PANEL VIEW === */
          <motion.div
            key="filter-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.2 }}
            className="bg-default"
          >
            <FilterPanel setShowFilterPanel={setShowFilterPanel} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
