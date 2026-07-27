import { LOCALS } from '../constants'
import type { Local, Order, OrderInput, ShirtColor, ShirtSize } from '../types'

const API_URL = import.meta.env.VITE_SHEETS_API_URL as string | undefined
const API_KEY = import.meta.env.VITE_SHEETS_API_KEY as string | undefined

export function isSheetsConfigured(): boolean {
  return Boolean(API_URL && API_KEY && API_KEY !== 'CHANGE_ME_TO_A_LONG_SECRET')
}

type ApiResponse = {
  ok: boolean
  error?: string
  orders?: Order[]
  order?: Order
}

async function callApi(payload: Record<string, unknown>): Promise<ApiResponse> {
  if (!isSheetsConfigured()) {
    throw new Error('Google Sheets API is not configured.')
  }

  const response = await fetch(API_URL!, {
    method: 'POST',
    // text/plain avoids a CORS preflight that Apps Script handles poorly
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ ...payload, apiKey: API_KEY }),
  })

  if (!response.ok) {
    throw new Error(`Sheets API HTTP ${response.status}`)
  }

  const data = (await response.json()) as ApiResponse
  if (!data.ok) {
    throw new Error(data.error || 'Sheets API request failed')
  }
  return data
}

function normalizeLocal(value: unknown): Local {
  if (value === 'Emmanuel & Liberty') return 'Emmanuel'
  if (typeof value === 'string' && (LOCALS as string[]).includes(value)) {
    return value as Local
  }
  return LOCALS[0]
}

function normalizeOrder(raw: Order): Order {
  return {
    ...raw,
    local: normalizeLocal(raw.local),
    color: raw.color as ShirtColor,
    size: raw.size as ShirtSize,
    paymentDataUrl: raw.paymentDataUrl || '',
  }
}

export async function fetchOrders(): Promise<Order[]> {
  const data = await callApi({ action: 'list' })
  return (data.orders || []).map(normalizeOrder)
}

export async function createOrder(input: OrderInput): Promise<Order> {
  const data = await callApi({
    action: 'create',
    order: {
      id: crypto.randomUUID(),
      ...input,
    },
  })
  if (!data.order) throw new Error('Create failed')
  return normalizeOrder(data.order)
}

export async function updateOrder(id: string, input: OrderInput): Promise<Order> {
  const data = await callApi({
    action: 'update',
    order: {
      id,
      ...input,
    },
  })
  if (!data.order) throw new Error('Update failed')
  return normalizeOrder(data.order)
}

export async function deleteOrder(id: string): Promise<void> {
  await callApi({ action: 'delete', id })
}
