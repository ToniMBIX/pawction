import React from 'react'
import { AuctionsAPI } from '../lib/api.js'
import { Toast } from '../components/Toast'

export default function BidBox({ auction, onBid }) {
  const [amount, setAmount] = React.useState(auction?.current_price || 0)
  const [loading, setLoading] = React.useState(false)
  const [toast, setToast] = React.useState({ message: "", type: "info" })

  const notify = (message, type = "info") => {
    setToast({ message, type })
    setTimeout(() => setToast({ message: "", type: "info" }), 3000)
  }

  const submit = async () => {
    if (!amount || Number(amount) <= auction.current_price) {
      return notify(
        `Debes superar la puja actual (${auction.current_price}€)`,
        "warning"
      )
    }

    setLoading(true)
    try {
      const r = await AuctionsAPI.bid(auction.id, Number(amount))
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
          Puja mínima: debe superar el precio actual
        </div>

        <div className="flex gap-2 mt-2">
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="border rounded-xl px-3 py-2 w-40"
          />
          <button
            onClick={submit}
            className="btn"
            disabled={loading}
          >
            {loading ? "Enviando..." : "Pujar"}
          </button>
        </div>
      </div>
    </>
  )
}
