import { useEffect, useId, useState } from 'react'
import type { FormEvent } from 'react'
import { COLORS, COLOR_IMAGES, LOCALS, SIZES } from '../constants'
import type { Local, Order, OrderInput, ShirtColor, ShirtSize } from '../types'
import { compressImage } from '../utils/compressImage'

interface OrderFormModalProps {
  order: Order | null
  busy?: boolean
  onClose: () => void
  onSave: (input: OrderInput) => void
}

const emptyForm = {
  local: LOCALS[0] as Local,
  name: '',
  phone: '',
  color: 'Blue' as ShirtColor,
  size: 'M' as ShirtSize,
  paymentDataUrl: '',
}

export function OrderFormModal({ order, busy = false, onClose, onSave }: OrderFormModalProps) {
  const titleId = useId()
  const [form, setForm] = useState(emptyForm)
  const [compressing, setCompressing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (order) {
      setForm({
        local: order.local,
        name: order.name,
        phone: order.phone,
        color: order.color,
        size: order.size,
        paymentDataUrl: order.paymentDataUrl,
      })
    } else {
      setForm(emptyForm)
    }
    setError('')
  }, [order])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handlePaymentChange(file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Payment screenshot must be an image.')
      return
    }
    setCompressing(true)
    setError('')
    try {
      const paymentDataUrl = await compressImage(file)
      setForm((current) => ({ ...current, paymentDataUrl }))
    } catch {
      setError('Could not process that image. Try another file.')
    } finally {
      setCompressing(false)
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const name = form.name.trim()
    const phone = form.phone.trim()
    if (!name) {
      setError('Name is required.')
      return
    }
    if (!phone) {
      setError('Phone number is required.')
      return
    }
    onSave({
      local: form.local,
      name,
      phone,
      color: form.color,
      size: form.size,
      paymentDataUrl: form.paymentDataUrl,
    })
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <h2 id={titleId}>{order ? 'Edit order' : 'Add order'}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <form className="order-form" onSubmit={handleSubmit}>
          <label>
            Local
            <select
              value={form.local}
              onChange={(event) =>
                setForm((current) => ({ ...current, local: event.target.value as Local }))
              }
            >
              {LOCALS.map((local) => (
                <option key={local} value={local}>
                  {local}
                </option>
              ))}
            </select>
          </label>

          <label>
            Name
            <input
              type="text"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Full name"
              autoFocus
            />
          </label>

          <label>
            Phone number
            <input
              type="tel"
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              placeholder="e.g. 024 xxx xxxx"
            />
          </label>

          <fieldset className="color-fieldset">
            <legend>T-shirt color</legend>
            <div className="color-grid">
              {COLORS.map((color) => (
                <label key={color} className={`color-option ${form.color === color ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="color"
                    value={color}
                    checked={form.color === color}
                    onChange={() => setForm((current) => ({ ...current, color }))}
                  />
                  <img src={COLOR_IMAGES[color]} alt={color} />
                  <span>{color}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label>
            Size
            <select
              value={form.size}
              onChange={(event) =>
                setForm((current) => ({ ...current, size: event.target.value as ShirtSize }))
              }
            >
              {SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>

          <label>
            Payment screenshot <span className="optional-tag">optional</span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => void handlePaymentChange(event.target.files?.[0])}
            />
          </label>

          {form.paymentDataUrl ? (
            <div className="payment-preview">
              <img src={form.paymentDataUrl} alt="Payment screenshot preview" />
              <button
                type="button"
                className="link-btn"
                onClick={() => setForm((current) => ({ ...current, paymentDataUrl: '' }))}
              >
                Remove
              </button>
            </div>
          ) : (
            <p className="field-hint">No screenshot yet — this order will be marked unpaid until you add one.</p>
          )}

          {error ? <p className="form-error">{error}</p> : null}

          <div className="modal-actions">
            <button type="button" className="btn secondary" onClick={onClose} disabled={busy || compressing}>
              Cancel
            </button>
            <button type="submit" className="btn primary" disabled={busy || compressing}>
              {compressing ? 'Compressing…' : busy ? 'Saving…' : order ? 'Save changes' : 'Add order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
