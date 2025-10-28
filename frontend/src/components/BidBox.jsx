import React from 'react'
import { AuctionsAPI } from '../lib/api.js'

export default function BidBox({ auction, onBid }){
  const [amount, setAmount] = React.useState(auction?.current_price || 0)
  const [loading, setLoading] = React.useState(false)
  const submit = async () => {
    setLoading(true)
    try{
      const r = await AuctionsAPI.bid(auction.id, Number(amount))
      onBid && onBid(r.auction)
    }catch(e){ alert('Error: ' + e.message) }
    setLoading(false)
  }
  return (
    <div className="card">
      <div className="text-sm opacity-70">Puja mínima: debe superar el precio actual</div>
      <div className="flex gap-2 mt-2">
        <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} className="border rounded-xl px-3 py-2 w-40"/>
        <button onClick={submit} className="btn" disabled={loading}>{loading ? 'Enviando...' : 'Pujar'}</button>
      </div>
    </div>
  )
}
