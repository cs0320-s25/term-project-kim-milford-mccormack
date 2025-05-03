'use client'
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'

export default function SearchBar() {
  return (
    <div className="relative">
      <div className="flex items-center bg-gray-100 rounded-lg">
        <div className="flex-1 flex items-center">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 ml-3" />
          <input
            type="text"
            placeholder="Search Places"
            className="w-full px-3 py-2 bg-transparent outline-none"
          />
        </div>
        <button className="p-2 hover:bg-gray-200 rounded-lg mr-1">
          <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-600" />
        </button>
      </div>
    </div>
  )
}