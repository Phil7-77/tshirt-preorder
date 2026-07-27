import { useEffect, useState } from 'react'
import { COLOR_IMAGES } from './constants'
import { DeleteConfirmModal } from './components/DeleteConfirmModal'
import { ImageLightbox } from './components/ImageLightbox'
import { OrderFormModal } from './components/OrderFormModal'
import type { Order, OrderInput } from './types'
import { downloadCsv } from './utils/csv'
import { loadOrders, saveOrders } from './utils/storage'

function createId() {
  return crypto.randomUUID()
}

export default function App() {
  const [orders, setOrders] = useState<Order[]>([])
  const [ready, setReady] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Order | null>(null)
  const [deleting, setDeleting] = useState<Order | null>(null)
  const [preview, setPreview] = useState<{ src: string; alt: string } | null>(null)

  useEffect(() => {
    setOrders(loadOrders())
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    saveOrders(orders)
  }, [orders, ready])

  function openAdd() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(order: Order) {
    setEditing(order)
    setModalOpen(true)
  }

  function handleSave(input: OrderInput) {
    const now = new Date().toISOString()
    if (editing) {
      setOrders((current) =>
        current.map((order) =>
          order.id === editing.id ? { ...order, ...input, updatedAt: now } : order,
        ),
      )
    } else {
      setOrders((current) => [
        {
          id: createId(),
          ...input,
          createdAt: now,
          updatedAt: now,
        },
        ...current,
      ])
    }
    setModalOpen(false)
    setEditing(null)
  }

  function handleDelete(order: Order) {
    setDeleting(order)
  }

  function confirmDelete() {
    if (!deleting) return
    setOrders((current) => current.filter((item) => item.id !== deleting.id))
    setDeleting(null)
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
          <button type="button" className="btn secondary" onClick={() => downloadCsv(orders)}>
            Export CSV
          </button>
          <button type="button" className="btn primary" onClick={openAdd}>
            Add order
          </button>
        </div>
      </header>

      <main className="content">
        {orders.length === 0 ? (
          <div className="empty">
            <h2>No orders yet</h2>
            <p>Add the first pre-order to start the list on this phone or browser.</p>
            <button type="button" className="btn primary" onClick={openAdd}>
              Add order
            </button>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Local</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Color</th>
                  <th>Size</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td data-label="Local">{order.local}</td>
                    <td data-label="Name">{order.name}</td>
                    <td data-label="Phone">{order.phone}</td>
                    <td data-label="Color">
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
                    </td>
                    <td data-label="Size">
                      <span className="size-pill">{order.size}</span>
                    </td>
                    <td data-label="Payment">
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
                          <img src={order.paymentDataUrl} alt="" />
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
                    </td>
                    <td data-label="Actions">
                      <div className="row-actions">
                        <button type="button" className="link-btn" onClick={() => openEdit(order)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="link-btn danger"
                          onClick={() => handleDelete(order)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {modalOpen ? (
        <OrderFormModal
          order={editing}
          onClose={() => {
            setModalOpen(false)
            setEditing(null)
          }}
          onSave={handleSave}
        />
      ) : null}

      {deleting ? (
        <DeleteConfirmModal
          order={deleting}
          onClose={() => setDeleting(null)}
          onConfirm={confirmDelete}
        />
      ) : null}

      {preview ? (
        <ImageLightbox
          src={preview.src}
          alt={preview.alt}
          onClose={() => setPreview(null)}
        />
      ) : null}
    </div>
  )
}
