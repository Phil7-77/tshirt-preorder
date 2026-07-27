import { useEffect, useId, useState } from 'react'
import type { FormEvent } from 'react'
import type { Order } from '../types'

const DELETE_PASSWORD = 'thispage'

interface DeleteConfirmModalProps {
  order: Order
  onClose: () => void
  onConfirm: () => void
}

export function DeleteConfirmModal({ order, onClose, onConfirm }: DeleteConfirmModalProps) {
  const titleId = useId()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (password !== DELETE_PASSWORD) {
      setError('Incorrect password.')
      return
    }
    onConfirm()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal delete-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <h2 id={titleId}>Delete order</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <form className="order-form" onSubmit={handleSubmit}>
          <p className="delete-copy">
            Enter the password to permanently delete the order for <strong>{order.name}</strong>.
          </p>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                setError('')
              }}
              placeholder="Enter password"
              autoFocus
              autoComplete="off"
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <div className="modal-actions">
            <button type="button" className="btn secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn danger">
              Delete order
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
