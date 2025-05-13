import {styled} from "@mui/system";
import {StarIcon} from "@heroicons/react/20/solid";
import React, {useState} from "react";

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

type PlacesType = {
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

type PopupContentProps = {
    places: ResType | undefined;
    popupId: string;
}

const PopupContent = ({places, popupId} : PopupContentProps) => {
    
    const sortMatch = (place: PlacesType) => {
        return (place.name + place.address) == popupId;
    }
        
        return (
        <div>
            {places?.results.map((place) => (
                <div>
                    {sortMatch(place) ?
                        <div className={"flex flex-col gap-2"}>
                            <h1 className={"text-lg font-bold text-primary"}>{place.name}</h1>
                            <h3>{place.address}</h3>
                            <div className="flex gap-1">
                                <p className="text-sm">{place.rating}</p>
                                <StarRating rating={place.rating}/>
                            </div>
                            <p className={"text-primary"}>
                                <div className={"font-bold"}>Description: </div>
                                {place.description}
                            </p>
                        </div> :
                        null
                    }
                </div>
            ))}
        </div>
        )
        }
        
        export default PopupContent;