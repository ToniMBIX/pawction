// frontend/src/pages/Checkout.jsx
import React from 'react'
import { useParams } from 'react-router-dom'
import { PaymentAPI, AuctionsAPI } from '../lib/api.js'

export default function Checkout(){
  const { id } = useParams()
  const [auction, setAuction] = React.useState(null)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(()=>{
    AuctionsAPI.get(id).then(setAuction).catch(()=>setAuction(null))
  }, [id])

  const pay = async () => {
    setLoading(true)
    try {
      // tu backend debería devolver, p.ej., { url: 'https://...' }
      const r = await PaymentAPI.checkout(id)
      if (r?.url) {
        window.location.href = r.url // redirigir a Stripe/PayPal
      } else {
        alert('No se recibió URL de pago.')
      }
    } catch (e) {
      alert(e.message || 'Error iniciando el checkout')
    } finally {
      setLoading(false)
    }
  }

  if (!auction) return <div className="opacity-70">Cargando...</div>
  return (
    <div className="card max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-2">Pagar subasta</h1>
      <div className="mb-4">
        <div className="font-semibold">{auction.title}</div>
        <div className="text-sm opacity-70">Actual: {auction.current_price} €</div>
      </div>
      <button className="btn w-full" onClick={pay} disabled={loading}>
        {loading ? 'Redirigiendo…' : 'Ir al pago'}
      </button>
    </div>
  )
}
