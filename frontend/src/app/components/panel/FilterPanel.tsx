"use client";
import React, { useState, useEffect } from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Button, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { CheckIcon } from "@heroicons/react/16/solid";
import { placesCategories } from "@/lib/constants";

const ratings = ["1.0", "2.0", "3.0", "4.0", "5.0"];

interface FilterPanelProps {
  setShowFilterPanel: (value: boolean) => void;
  onFilterChange?: (filters: {
    price: string;
    ratings: string[];
    hours: string;
    places: string[];
  }) => void;
}

export default function FilterPanel({
  setShowFilterPanel,
  onFilterChange,
}: FilterPanelProps) {
  const [price, setPrice] = useState("");
  const [selectedRatings, setSelectedRatings] = useState<string[]>([]);
  const [hours, setHours] = useState("");
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([]);

  useEffect(() => {
    onFilterChange?.({
      price,
      ratings: selectedRatings,
      hours,
      places: selectedPlaces,
    });
  }, [price, selectedRatings, hours, selectedPlaces, onFilterChange]);

  const handleClear = () => {
    setPrice("");
    setSelectedRatings([]);
    setHours("");
    setSelectedPlaces([]);
  };

  const handlePriceChange = (
    _event: React.MouseEvent<HTMLElement>,
    newPrice: string | null
  ) => {
    if (newPrice !== null) setPrice(newPrice);
  };

  return (
    <aside
      aria-label="Filter options"
      className="flex flex-col gap-4 px-4 py-3"
    >
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => setShowFilterPanel(false)}
          aria-label="Close filter panel"
          className="p-1 focus:outline focus:outline-offset-2 focus:outline-primary"
        >
          <ArrowLeftIcon
            aria-hidden="true"
            className="h-5 w-5 icon-gray-600 p-0"
          />
        </button>

        <Button variant="text" onClick={handleClear}>
          Clear
        </Button>
      </div>

      {/* Price Filter */}
      <div className="flex flex-col gap-3">
        <p>Price</p>
        <ToggleButtonGroup
          value={price}
          exclusive
          onChange={handlePriceChange}
          aria-label="Price filter"
          fullWidth
        >
          {["$", "$$", "$$$", "$$$$", "$$$$$"].map((lvl) => (
            <ToggleButton
              key={lvl}
              value={lvl}
              aria-label={`Filter by ${lvl}`}
              sx={{
                borderRadius: "999px",
                px: 2,
                py: 0.5,
                textTransform: "none",
                border: "2px solid",
                borderColor: price === lvl ? "primary.dark" : "grey.400",
                color: price === lvl ? "primary.dark" : "text.primary",
                backgroundColor:
                  price === lvl ? "rgba(25,118,210,0.08)" : "transparent",
                "&.Mui-selected": {
                  borderColor: "primary.dark",
                  backgroundColor: "rgba(25,118,210,0.08)",
                },
                "&.Mui-selected:hover": {
                  backgroundColor: "rgba(25,118,210,0.12)",
                },
              }}
            >
              {price === lvl && (
                <CheckIcon
                  aria-hidden="true"
                  className="h-5 w-5 icon-black p-0"
                />
              )}
              {lvl}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </div>

      {/* Ratings Filter */}
      <div className="flex flex-col gap-3 ">
        <p>Ratings</p>
        <ToggleButtonGroup
          value={selectedRatings}
          onChange={(_e, val) =>
            setSelectedRatings(typeof val === "string" ? [val] : val)
          }
          aria-label="Ratings filter"
        >
          {ratings.map((r) => (
            <ToggleButton
              key={r}
              value={r}
              selected={selectedRatings.includes(r)}
              aria-label={`Filter by ${r} stars`}
              sx={{
                borderRadius: "999px",
                px: 2,
                py: 0.5,
                textTransform: "none",
                border: "2px solid",
                borderColor: selectedRatings.includes(r)
                  ? "primary.dark"
                  : "grey.400",
                color: selectedRatings.includes(r)
                  ? "primary.dark"
                  : "text.primary",
                backgroundColor: selectedRatings.includes(r)
                  ? "rgba(25,118,210,0.08)"
                  : "transparent",
                "&.Mui-selected": {
                  borderColor: "primary.dark",
                  backgroundColor: "rgba(25,118,210,0.08)",
                },
                "&.Mui-selected:hover": {
                  backgroundColor: "rgba(25,118,210,0.12)",
                },
              }}
            >
              {selectedRatings.includes(r) && (
                <CheckIcon
                  aria-hidden="true"
                  className="h-5 w-5 icon-black p-0"
                />
              )}
              {r}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </div>

      {/* Hours Filter */}
      <div className="flex flex-col gap-3">
        <p>Hours</p>
        <ToggleButtonGroup
          value={hours}
          exclusive
          onChange={(_e, val) => val !== null && setHours(val)}
          aria-label="Hours filter"
          fullWidth
        >
          {["any-time", "open-now", "24-hours"].map((h) => (
            <ToggleButton
              key={h}
              value={h}
              aria-label={`Filter by ${h.replace("-", " ")}`}
              sx={{
                borderRadius: "999px",
                px: 2,
                py: 0.5,
                textTransform: "none",
                border: "2px solid",
                borderColor: hours === h ? "primary.dark" : "grey.400",
                color: hours === h ? "primary.dark" : "text.primary",
                backgroundColor:
                  hours === h ? "rgba(25,118,210,0.08)" : "transparent",
                "&.Mui-selected": {
                  borderColor: "primary.dark",
                  backgroundColor: "rgba(25,118,210,0.08)",
                },
                "&.Mui-selected:hover": {
                  backgroundColor: "rgba(25,118,210,0.12)",
                },
              }}
            >
              {h.replace("-", " ")}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </div>

      {/* Places Filter */}
      <div className="flex flex-col gap-3">
        <p>Places</p>
        <div className="flex flex-wrap gap-2">
          {placesCategories.map((pl) => (
            <ToggleButton
              key={pl}
              value={pl}
              selected={selectedPlaces.includes(pl)}
              onChange={(_e, val) =>
                val !== null &&
                setSelectedPlaces((prev) =>
                  prev.includes(val)
                    ? prev.filter((x) => x !== val)
                    : [...prev, val]
                )
              }
              aria-label={`Filter by ${pl}`}
              sx={{
                borderRadius: "999px",
                px: 2,
                py: 0.5,
                textTransform: "none",
                border: "2px solid",
                borderColor: selectedPlaces.includes(pl)
                  ? "primary.dark"
                  : "grey.400",
                color: selectedPlaces.includes(pl)
                  ? "primary.dark"
                  : "text.primary",
                backgroundColor: selectedPlaces.includes(pl)
                  ? "rgba(10, 124, 238, 0.08)"
                  : "transparent",
                "&.Mui-selected": {
                  borderColor: "primary.dark",
                  backgroundColor: "rgba(16, 129, 241, 0.08)",
                },
                "&.Mui-selected:hover": {
                  backgroundColor: "rgba(16, 126, 236, 0.4)",
                },
              }}
            >
              {selectedPlaces.includes(pl) && (
                <CheckIcon
                  aria-hidden="true"
                  className="h-5 w-5 icon-black p-0"
                />
              )}
              {pl}
            </ToggleButton>
          ))}
        </div>
      </div>
    </aside>
  );
}
