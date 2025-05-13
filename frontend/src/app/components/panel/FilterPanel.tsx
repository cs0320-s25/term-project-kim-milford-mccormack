'use client'
import {ArrowLeftIcon} from '@heroicons/react/24/outline'
import {Button, ButtonGroup, ToggleButton, ToggleButtonGroup} from "@mui/material";
import React, {useState, useEffect} from "react";
import {CheckIcon} from "@heroicons/react/16/solid";
import {placesCategories} from "@/lib/constants"

const ratings = ['1.0', '2.0', '3.0', '4.0', '5.0'];

interface FilterPanelProps {
    setShowFilterPanel: (value: boolean) => void;
    onFilterChange?: (filters: {
        price: string;
        ratings: string[];
        hours: string;
        places: string[];
    }) => void;
}

export default function FilterPanel({ setShowFilterPanel, onFilterChange }: FilterPanelProps) {
    const [price, setPrice] = useState('');
    const [selectedRatings, setSelectedRatings] = useState<string[]>([]);
    const [hours, setHours] = useState('');
    const [selectedPlaces, setSelectedPlaces] = useState<string[]>([]);

    // Update parent whenever any filter changes
    useEffect(() => {
        if (onFilterChange) {
            onFilterChange({
                price,
                ratings: selectedRatings,
                hours,
                places: selectedPlaces
            });
        }
    }, [price, selectedRatings, hours, selectedPlaces, onFilterChange]);

    const handleClear = () => {
        setPrice('');
        setSelectedRatings([]);
        setHours('');
        setSelectedPlaces([]);
    }

    const handlePriceChange = (
        event: React.MouseEvent<HTMLElement>,
        newPrice: string | null
    ) => {
        if (newPrice !== null) {
            setPrice(newPrice);
        }
    };

    const handleRatingChange = (
        event: React.MouseEvent<HTMLElement>,
        rating: string
    ) => {
        setSelectedRatings((prevSelected) =>
            prevSelected.includes(rating)
                ? prevSelected.filter((r) => r !== rating) // remove if already selected
                : [...prevSelected, rating] // add if not selected
        );
    };

    const handleHoursChange = (
        event: React.MouseEvent<HTMLElement>,
        newHours: string | null
    ) => {
        if (newHours != null) {
            setHours(newHours);
        }
    }

    const handlePlaceChange = (
        event: React.MouseEvent<HTMLElement>,
        newPlaces: string
    ) => {
        setSelectedPlaces((prevSelected) =>
            prevSelected.includes(newPlaces) ?
                prevSelected.filter((r) => r !== newPlaces)
                : [...prevSelected, newPlaces]
        );
    }

    return (
        <div className="flex flex-col gap-4 px-4 py-3">
            <div className="flex justify-between">
                <Button variant="text" sx={{minWidth: 'auto'}} onClick={() => setShowFilterPanel(false)}>
                    <ArrowLeftIcon className="h-5 w-5 icon-gray-600 p-0"/>
                </Button>
                <Button variant="text" onClick={handleClear}>Clear</Button>
            </div>

            {/*Price*/}
            <div className={"flex flex-col justify-between gap-3"}>
                <p>Price</p>
                <ToggleButtonGroup
                    color="primary"
                    value={price}
                    exclusive
                    onChange={handlePriceChange}
                    aria-label="Price"
                    fullWidth={true}
                >
                    <ToggleButton value="$">$</ToggleButton>
                    <ToggleButton value="$$">$$</ToggleButton>
                    <ToggleButton value="$$$">$$$</ToggleButton>
                    <ToggleButton value="$$$$">$$$$</ToggleButton>
                    <ToggleButton value="$$$$$">$$$$$</ToggleButton>
                </ToggleButtonGroup>
            </div>

            {/*Ratings*/}
            <div className="flex flex-col gap-3">
                <p>Ratings</p>
                <div className="grid grid-cols-5 gap-2 w-full">
                    {ratings.map((rating) => (
                        <ToggleButton
                            key={rating}
                            value={rating}
                            selected={selectedRatings.includes(rating)}
                            onChange={handleRatingChange}
                            sx={{
                                flex: 1,
                                borderRadius: '999px',
                                px: 2,
                                py: 0.5,
                                textTransform: 'capitalize',
                                border: '1px solid',
                                borderColor: selectedRatings.includes(rating) ? 'primary.main' : 'grey.400',
                                color: selectedRatings.includes(rating) ? 'primary.main' : 'text.primary',
                                backgroundColor: 'transparent',
                                '&.Mui-selected': {
                                    backgroundColor: 'transparent',
                                    color: 'primary.main',
                                    borderColor: 'primary.main',
                                },
                                '&.Mui-selected:hover': {
                                    backgroundColor: 'transparent',
                                }
                            }}
                        >
                            {selectedRatings.includes(rating) && (
                                <CheckIcon className="h-5 w-5 icon-black p-0"/>
                            )}
                            <span className="flex items-center gap-1">
                                <span className="icon-orange-main">★</span>
                                {rating}
                            </span>
                        </ToggleButton>
                    ))}
                </div>
            </div>

            {/*Hours*/}
            <div className={"flex flex-col justify-between gap-3"}>
                <p>Hours</p>
                <ToggleButtonGroup
                    color="primary"
                    value={hours}
                    exclusive
                    onChange={handleHoursChange}
                    aria-label="Hours"
                    fullWidth={true}
                >
                    <ToggleButton value="any-time" sx={{textTransform: 'none'}}>Any time</ToggleButton>
                    <ToggleButton value="open-now" sx={{textTransform: 'none'}}>Open now</ToggleButton>
                    <ToggleButton value="25-hours" sx={{textTransform: 'none'}}>Open 24-hours</ToggleButton>
                </ToggleButtonGroup>
            </div>


            {/*Places*/}
            <div className="flex flex-col gap-3">
                <p>Places</p>
                <div className="flex flex-wrap gap-2">
                    {placesCategories.map((place) => (
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
                                }
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
        </div>
    )
}