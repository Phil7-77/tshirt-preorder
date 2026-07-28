import { useEffect, useState } from 'react'
import { COLOR_IMAGES } from './constants'
import { DeleteConfirmModal } from './components/DeleteConfirmModal'
import { ImageLightbox } from './components/ImageLightbox'
import { OrderFormModal } from './components/OrderFormModal'
import type { Order, OrderInput } from './types'
import { downloadCsv } from './utils/csv'
import {
  createOrder,
  deleteOrder,
  fetchOrders,
  isSheetsConfigured,
  updateOrder,
} from './utils/sheetsApi'

export default function App() {
  const [orders, setOrders] = useState<Order[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Order | null>(null)
  const [deleting, setDeleting] = useState<Order | null>(null)
  const [preview, setPreview] = useState<{ src: string; alt: string } | null>(null)
  const sheetsReady = isSheetsConfigured()

  const query = search.trim().toLowerCase()
  const filteredOrders = query
    ? orders.filter((order) => {
        const haystack = [
          order.name,
          order.phone,
          order.local,
          order.color,
          order.size,
          order.paymentDataUrl ? 'paid' : 'unpaid',
        ]
          .join(' ')
          .toLowerCase()
        return haystack.includes(query)
      })
    : orders

  async function refreshOrders() {
    const next = await fetchOrders()
    setOrders(next)
  }

  useEffect(() => {
    if (!sheetsReady) {
      setLoading(false)
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        setError('')
        await refreshOrders()
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load orders')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [sheetsReady])

  function openAdd() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(order: Order) {
    setEditing(order)
    setModalOpen(true)
  }

  async function handleSave(input: OrderInput) {
    setSaving(true)
    setError('')
    try {
      if (editing) {
        const updated = await updateOrder(editing.id, input)
        setOrders((current) =>
          current.map((order) => (order.id === updated.id ? updated : order)),
        )
      } else {
        const created = await createOrder(input)
        setOrders((current) => [created, ...current])
      }
      setModalOpen(false)
      setEditing(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save order')
    } finally {
      setSaving(false)
    }
  }

  function handleDelete(order: Order) {
    setDeleting(order)
  }

  async function confirmDelete() {
    if (!deleting) return
    setSaving(true)
    setError('')
    try {
      await deleteOrder(deleting.id)
      setOrders((current) => current.filter((item) => item.id !== deleting.id))
      setDeleting(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete order')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="app">
      <div className="bg-wash" aria-hidden="true" />

      <header className="topbar">
        <div className="brand-block">
          <p className="eyebrow">Chalaph</p>
          <h1>T-Shirt Pre-order</h1>
        </div>
        <div className="top-actions">
          <button
            type="button"
            className="btn secondary"
            onClick={() => downloadCsv(orders)}
            disabled={!sheetsReady || loading || orders.length === 0}
          >
            Export CSV
          </button>
          <button
            type="button"
            className="btn primary"
            onClick={openAdd}
            disabled={!sheetsReady || loading || saving}
          >
            Add order
          </button>
        </div>
      </header>

      {!sheetsReady ? (
        <div className="banner warn">
          Google Sheets is not configured yet. Add <code>VITE_SHEETS_API_URL</code> and{' '}
          <code>VITE_SHEETS_API_KEY</code>, then follow <code>SETUP_SHEETS.md</code>.
        </div>
      ) : null}

      {error ? (
        <div className="banner error">
          <span>{error}</span>
          {sheetsReady ? (
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                setLoading(true)
                setError('')
                void refreshOrders()
                  .catch((err) =>
                    setError(err instanceof Error ? err.message : 'Could not load orders'),
                  )
                  .finally(() => setLoading(false))
              }}
            >
              Retry
            </button>
          ) : null}
        </div>
      ) : null}

      <main className="content">
        {loading ? (
          <div className="empty">
            <h2>Loading orders…</h2>
            <p>Fetching the shared list from Google Sheets.</p>
          </div>
        ) : !sheetsReady ? (
          <div className="empty">
            <h2>Setup required</h2>
            <p>Connect the Google Sheet backend before taking orders.</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty">
            <h2>No orders yet</h2>
            <p>Click on the Add order button to make your order</p>
          </div>
        ) : (
          <>
            <div className="search-bar">
              <label className="search-label" htmlFor="member-search">
                Search members
              </label>
              <input
                id="member-search"
                type="search"
                className="search-input"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, phone, local…"
                autoComplete="off"
              />
              {query ? (
                <p className="search-meta">
                  {filteredOrders.length} of {orders.length} order
                  {orders.length === 1 ? '' : 's'}
                </p>
              ) : null}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="empty">
                <h2>No matches</h2>
                <p>Try another name, phone number, or local.</p>
              </div>
            ) : (
          <div className="orders-panel">
            <div className="orders-head" aria-hidden="true">
              <span>Local</span>
              <span>Name</span>
              <span>Phone</span>
              <span>Color</span>
              <span>Size</span>
              <span>Payment</span>
              <span>Actions</span>
            </div>
            <ul className="orders-list">
              {filteredOrders.map((order) => (
                <li key={order.id} className="order-card">
                  <div className="order-local">{order.local}</div>
                  <div className="order-name">{order.name}</div>
                  <a className="order-phone" href={`tel:${order.phone}`}>
                    {order.phone}
                  </a>
                  <div className="order-color">
                    <button
                      type="button"
                      className="thumb-btn"
                      onClick={() =>
                        setPreview({
                          src: COLOR_IMAGES[order.color],
                          alt: `${order.color} t-shirt`,
                        })
                      }
                      title={`Preview ${order.color}`}
                    >
                      <img src={COLOR_IMAGES[order.color]} alt="" />
                      <span>{order.color}</span>
                    </button>
                  </div>
                  <div className="order-size">
                    <span className="size-pill">{order.size}</span>
                  </div>
                  <div className="order-payment">
                    {order.paymentDataUrl ? (
                      <button
                        type="button"
                        className="thumb-btn payment-thumb"
                        onClick={() =>
                          setPreview({
                            src: order.paymentDataUrl,
                            alt: `Payment for ${order.name}`,
                          })
                        }
                        title="Preview payment"
                      >
                        <img
                          src={order.paymentDataUrl}
                          alt=""
                          referrerPolicy="no-referrer"
                        />
                        <span className="status-pill paid">Paid</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="status-pill unpaid"
                        onClick={() => openEdit(order)}
                        title="Add payment screenshot"
                      >
                        Unpaid
                      </button>
                    )}
                  </div>
                  <div className="order-actions">
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => openEdit(order)}
                      disabled={saving}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="link-btn danger"
                      onClick={() => handleDelete(order)}
                      disabled={saving}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
            )}
          </>
        )}
      </main>

      {modalOpen ? (
        <OrderFormModal
          order={editing}
          busy={saving}
          onClose={() => {
            if (saving) return
            setModalOpen(false)
            setEditing(null)
          }}
          onSave={(input) => {
            void handleSave(input)
          }}
        />
      ) : null}

      {deleting ? (
        <DeleteConfirmModal
          order={deleting}
          onClose={() => {
            if (saving) return
            setDeleting(null)
          }}
          onConfirm={() => {
            void confirmDelete()
          }}
        />
      ) : null}

      {preview ? (
        <ImageLightbox
          src={preview.src}
          alt={preview.alt}
          onClose={() => setPreview(null)}
        />
      ) : null}

      {saving ? <div className="saving-toast">Saving…</div> : null}
    </div>
  )
}
