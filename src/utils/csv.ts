import type { Order } from '../types'

function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function ordersToCsv(orders: Order[]): string {
  const headers = [
    'Local',
    'Name',
    'Phone',
    'Color',
    'Size',
    'Payment Status',
    'Created At',
    'Updated At',
  ]

  const rows = orders.map((order) =>
    [
      order.local,
      order.name,
      order.phone,
      order.color,
      order.size,
      order.paymentDataUrl ? 'Paid' : 'Unpaid',
      order.createdAt,
      order.updatedAt,
    ]
      .map(escapeCsv)
      .join(','),
  )

  return [headers.join(','), ...rows].join('\n')
}

export function downloadCsv(orders: Order[], filename = 'tshirt-preorders.csv'): void {
  const csv = ordersToCsv(orders)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
