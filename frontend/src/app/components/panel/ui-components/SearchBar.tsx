"use client";
import React, { useState, Dispatch, SetStateAction } from "react";
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";

interface SearchBarProps {
  onFilter?: () => void;
  onKeywordChange: (value: string) => void;
  setRenderMarker: Dispatch<SetStateAction<boolean>>;
}

export default function SearchBar({
  onFilter,
  onKeywordChange,
  setRenderMarker,
}: SearchBarProps) {
  const [input, setInput] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onKeywordChange(input);
      setRenderMarker(true);
    }
  };

  return (
    <div className="flex gap-2 px-4 py-3">
      <div
        className="grow flex items-center bg-gray-100 rounded-lg focus-within:outline focus-within:outline-2
        focus-within:outline-blue-500"
      >
        <MagnifyingGlassIcon
          aria-hidden="true"
          className="h-5 w-5 icon-gray ml-3"
        />
        <label htmlFor="search-input" className="sr-only">
          Search Places
        </label>
        <input
          id="search-input"
          type="text"
          placeholder="Search Places"
          aria-label="Search Places"
          className="w-full px-3 py-2 bg-transparent outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <button
        type="button"
        onClick={onFilter}
        aria-label="Open filter options"
        className="p-2 hover:bg-blue-200 rounded-lg"
      >
        <AdjustmentsHorizontalIcon
          aria-hidden="true"
          className="h-5 w-5 icon-gray-dark"
        />
      </button>
    </div>
  );
}
