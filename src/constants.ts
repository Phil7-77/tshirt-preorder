import type { Local, ShirtColor, ShirtSize } from './types'

export const LOCALS: Local[] = [
  'Riis',
  'Prince of Peace',
  'Promised Land',
  'Emmanuel',
  'Liberty',
]

export const COLORS: ShirtColor[] = ['Blue', 'White', 'Yellow', 'Black']

export const SIZES: ShirtSize[] = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL']

export const COLOR_IMAGES: Record<ShirtColor, string> = {
  Blue: '/tshirts/blue.jpg',
  White: '/tshirts/white.jpg',
  Yellow: '/tshirts/yellow.jpg',
  Black: '/tshirts/black.jpg',
}

export const STORAGE_KEY = 'tshirt-preorders-v1'
