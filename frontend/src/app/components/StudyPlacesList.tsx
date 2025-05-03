'use client'
import { StarIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'
import { StudyPlace } from '../../../types'
import Image from 'next/image'

const MOCK_PLACES: StudyPlace[] = Array(10).fill(null).map((_, i) => ({
  id: `place-${i}`,
  name: 'Cafe Name',
  rating: 4.5,
  reviewCount: 36,
  type: 'Cafe / Restaurant',
  address: '1100 N Main St, Providence',
  openingHours: 'Open',
  closingHours: 'Closes 10PM',
  imageUrl: '/placeholder.jpg',
  noiseLevel: i % 2 === 0 ? 'Quiet' : 'Bright'
}))

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}>
          {star <= rating ? (
            <StarIcon className="h-4 w-4 text-yellow-400" />
          ) : (
            <StarOutlineIcon className="h-4 w-4 text-yellow-400" />
          )}
        </span>
      ))}
    </div>
  )
}

export default function StudyPlacesList() {
  return (
    <div className="flex-1 overflow-y-auto">
      {MOCK_PLACES.map((place) => (
        <div
          key={place.id}
          className="p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
        >
          <div className="flex gap-4">
            <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-gray-200">
              <Image
                src={place.imageUrl}
                alt={place.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{place.name}</h3>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <RatingStars rating={place.rating} />
                <span>({place.reviewCount})</span>
              </div>
              <p className="text-sm text-gray-600">{place.type}</p>
              <p className="text-sm text-gray-600">{place.address}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-green-600">{place.openingHours}</span>
                <span className="text-sm text-gray-600">•</span>
                <span className="text-sm text-gray-600">{place.closingHours}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 