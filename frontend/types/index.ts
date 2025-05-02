export enum NoiseLevel {
  Quiet = 'Quiet',
  Bright = 'Bright'
}

export interface StudyPlace {
  id: string
  name: string
  rating: number
  reviewCount: number
  type: string
  address: string
  openingHours: string
  closingHours: string
  imageUrl: string
  noiseLevel: NoiseLevel
}

export interface SearchFilters {
  noiseLevel?: NoiseLevel
  rating?: number
  isOpen?: boolean
} 