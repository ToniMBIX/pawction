import React from 'react'
import { AuctionsAPI } from '../lib/api.js'

export default function BidBox({ auction, onBid }) {
  const [amount, setAmount] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState({})
  const [generalError, setGeneralError] = React.useState('')

  const fieldError = (field) => errors?.[field]?.[0]

  const submit = async (e) => {
    e.preventDefault()

    setLoading(true)
    setErrors({})
    setGeneralError('')

    try {
      await AuctionsAPI.bid(auction.id, amount)

      setAmount('')

      if (onBid) {
        onBid()
      }
    } catch (e) {
      setErrors(e.errors || {})
      setGeneralError(e.message || 'No se pudo realizar la puja')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="card mt-4" noValidate>
      <h3 className="font-bold mb-2">Hacer una puja</h3>

      {generalError && (
        <div className="mb-3 rounded-xl border border-red-500 bg-red-50 px-3 py-2 text-sm text-red-700">
          {generalError}
        </div>
      )}

      <div className="mb-3">
        <input
          className="border rounded-xl px-3 py-2 w-full"
          type="text"
          inputMode="numeric"
          placeholder={`Mayor que ${auction.current_price || auction.starting_price} €`}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        {fieldError('amount') && (
          <p className="mt-1 text-sm text-red-600">
            {fieldError('amount')}
          </p>
        )}

        {fieldError('auction_id') && (
          <p className="mt-1 text-sm text-red-600">
            {fieldError('auction_id')}
          </p>
        )}
      </div>

      <button className="btn w-full" disabled={loading}>
        {loading ? 'Pujando...' : 'Pujar'}
      </button>
    </form>
  )
}