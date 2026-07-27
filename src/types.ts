export type Local =
  | 'Riis'
  | 'Prince of Peace'
  | 'Promised Land'
  | 'Emmanuel'
  | 'Liberty'

export type ShirtColor = 'Blue' | 'White' | 'Yellow' | 'Black'

export type ShirtSize = 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL'

export interface Order {
  id: string
  local: Local
  name: string
  phone: string
  color: ShirtColor
  size: ShirtSize
  paymentDataUrl: string
  createdAt: string
  updatedAt: string
}

export type OrderInput = Omit<Order, 'id' | 'createdAt' | 'updatedAt'>
