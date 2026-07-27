import { LOCALS, STORAGE_KEY } from '../constants'
import type { Local, Order } from '../types'

function normalizeLocal(value: unknown): Local {
  if (value === 'Emmanuel & Liberty') return 'Emmanuel'
  if (typeof value === 'string' && (LOCALS as string[]).includes(value)) {
    return value as Local
  }
  return LOCALS[0]
}

export function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.map((item) => {
      const order = item as Order
      return { ...order, local: normalizeLocal(order.local) }
    })
  } catch {
    return []
  }
}

export function saveOrders(orders: Order[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
}
