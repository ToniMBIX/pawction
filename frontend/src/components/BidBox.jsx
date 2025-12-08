import React from 'react'
import { AuctionsAPI } from '../lib/api.js'
import { Toast } from '../components/Toast'

export default function BidBox({ auction, onBid }) {
  const current = Number(auction.current_price)
  const minBid = current > 0 ? current + 1 : 20

  const [amount, setAmount] = React.useState(minBid)
  const [loading, setLoading] = React.useState(false)
  const [toast, setToast] = React.useState({ message: "", type: "info" })

  const notify = (message, type = "info") => {
    setToast({ message, type })
    setTimeout(() => setToast({ message: "", type: "info" }), 3000)
  }

  const submit = async () => {
    const bidValue = Number(amount)

    if (isNaN(bidValue) || bidValue < minBid) {
      return notify(`La puja mínima ahora es ${minBid}€`, "warning")
    }

    setLoading(true)
    try {
      const r = await AuctionsAPI.bid(auction.id, bidValue)
      notify("Puja realizada correctamente 🎉", "success")
      onBid && onBid(r.auction)
    } catch (e) {
      notify("Error: " + e.message, "error")
    }
    setLoading(false)
  }

  return (
    <>
      <Toast message={toast.message} type={toast.type} />

      <div className="card">
        <div className="text-sm opacity-70">
          Puja mínima: <b>{minBid}€</b>
        </div>

        <div className="flex gap-2 mt-2">
          <input
            type="number"
            value={amount}
            min={minBid}
            onChange={e => setAmount(e.target.value)}
            className="border rounded-xl px-3 py-2 w-40"
          />
          <button onClick={submit} className="btn" disabled={loading}>
            {loading ? "Enviando..." : "Pujar"}
          </button>
        </div>
      </div>
    </>
  )
}
