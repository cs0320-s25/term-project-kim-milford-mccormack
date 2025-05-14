"use client";
import React from "react";
import { styled } from "@mui/system";
import { StarIcon, XMarkIcon } from "@heroicons/react/20/solid";

const StyledDialog = styled("div")(() => ({
  position: "relative",
  padding: "1rem",
}));

const StarRating = ({ rating }: { rating: number }) => {
  const rounded = Math.round(rating * 2) / 2;
  const fullStars = Math.floor(rounded);
  const halfStar = rounded % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div
      className="flex items-center gap-1"
      aria-label={`Rating: ${rating} out of 5`}
    >
      {[...Array(fullStars)].map((_, i) => (
        <StarIcon
          key={`full-${i}`}
          className="h-5 w-5 icon-orange-main"
          aria-hidden="true"
        />
      ))}
      {halfStar && (
        <StarIcon
          className="h-5 w-5 icon-orange-main opacity-50"
          aria-hidden="true"
        />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <StarIcon
          key={`empty-${i}`}
          className="h-5 w-5 icon-grey-400"
          aria-hidden="true"
        />
      ))}
    </div>
  );
};

export type PlacesType = {
  name: string;
  address: string;
  location: { lat: number; lng: number };
  rating: number;
  open_now: boolean;
  description: string;
};

export type ResType = { results: PlacesType[] };

interface PopupContentProps {
  places: ResType | undefined;
  popupId: string;
}

export default function PopupContent({ places, popupId }: PopupContentProps) {
  return (
    <StyledDialog
      className="bg-paper rounded-lg shadow-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-title"
    >
      <button
        type="button"
        onClick={() => {
          /* your close logic here */
        }}
        className="absolute top-2 right-2 p-1 focus:outline focus:outline-offset-2 focus:outline-primary"
        aria-label="Close details"
      >
        <XMarkIcon className="h-5 w-5" aria-hidden="true" />
      </button>

      {places?.results.map((place) =>
        place.name + place.address === popupId ? (
          <div className="flex flex-col gap-2" key={popupId}>
            <h1 id="popup-title" className="text-lg font-bold text-primary">
              {place.name}
            </h1>
            <h3>{place.address}</h3>
            <div className="flex items-center gap-1">
              <p className="text-sm">{place.rating}</p>
              <StarRating rating={place.rating} />
            </div>
            <div>
              <span className="font-bold">Description:</span>{" "}
              {place.description}
            </div>
          </div>
        ) : null
      )}
    </StyledDialog>
  );
}
