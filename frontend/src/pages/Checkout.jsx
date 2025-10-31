import React from 'react'
import { useParams } from 'react-router-dom'
import { PaymentAPI, AuctionsAPI } from '../lib/api.js'

export default function Checkout(){
  const { id } = useParams()
  const [intent, setIntent] = React.useState(null)
  const [auction, setAuction] = React.useState(null)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    (async () => {
      try {
        const a = await AuctionsAPI.get(id)
        setAuction(a.data)
        const r = await PaymentAPI.checkout(id)
        setIntent(r)
      } catch(e) {
        setError(e.message)
      }
    })()
  }, [id])

  if (error) return <div className="p-6 text-red-700">Error: {error}</div>
  if (!auction || !intent) return <div className="p-6">Cargando…</div>

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Pagar subasta #{auction.id}</h1>
      <p className="text-gray-600">Importe: <b>{(auction.current_price||0).toFixed(2)} €</b></p>
      <div className="p-4 rounded bg-gray-50">
        <div className="text-sm text-gray-500">client_secret</div>
        <code className="break-all">{intent.client_secret}</code>
      </div>
      <p className="text-sm text-gray-500">
        Integra aquí Stripe Elements (opcional). El webhook de backend ya registra el pago,
        crea el payout 50/50 y envía el email con PDF y QR al ganador.
      </p>
    </div>
  )
}
