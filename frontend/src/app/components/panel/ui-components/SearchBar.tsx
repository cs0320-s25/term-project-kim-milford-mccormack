'use client'
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'
import React, {Dispatch, SetStateAction, useState} from "react";

interface SearchBarProps {
    onFilter?: () => void;
    onKeywordChange: (value: string) => void; //set query params
    setRenderMarker: React.Dispatch<SetStateAction<boolean>>;
}

export default function SearchBar({ onFilter, onKeywordChange, setRenderMarker }: SearchBarProps) {
    const [input, setInput] = useState<string>(''); // set text input

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            onKeywordChange(input);
            setRenderMarker(true);
        }
    };

    return (
      <div className="flex gap-2 px-4 py-3">
          {/*search input*/}
          <div className="grow items-center bg-gray-100 rounded-lg ">
          <div className="flex items-center">
            <MagnifyingGlassIcon className="h-5 w-5 icon-gray ml-3"/>
            <input
                type="text"
                placeholder="Search Places"
                className="w-full px-3 py-2 bg-transparent outline-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        {/*filter*/}
        <button
            className="p-2 hover:bg-gray-200 rounded-lg mr-1"
            onClick={onFilter}
        >
          <AdjustmentsHorizontalIcon className="h-5 w-5 icon-gray-dark"/>
        </button>
      </div>
    );
}
