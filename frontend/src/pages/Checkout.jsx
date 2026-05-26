import React from 'react'
import { useParams } from 'react-router-dom'
import { PaymentAPI } from '../lib/api.js'
import { Auth } from '../lib/auth.js'

export default function Checkout() {
  const { id } = useParams()

  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  const pay = async () => {
    if (!Auth.isLogged()) {
      setError('Debes iniciar sesión para continuar')
      return
    }

    setLoading(true)
    setError('')

    try {
      const r = await PaymentAPI.createStripeCheckout(Number(id))

      if (!r.checkout_url) {
        throw new Error('Stripe no devolvió URL de pago')
      }

      window.location.href = r.checkout_url
    } catch (err) {
      setError(err.message || 'No se pudo iniciar el pago')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Finalizar pago</h1>

      <p className="opacity-70 mb-6">
        Vas a pagar el importe final de la subasta mediante Stripe.
      </p>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button onClick={pay} className="btn w-full" disabled={loading}>
        {loading ? 'Redirigiendo a Stripe...' : 'Pagar con Stripe'}
      </button>
    </div>
  )
}