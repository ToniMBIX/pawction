import React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PaymentAPI } from '../lib/api.js'

export default function PaymentSuccess() {
  const [params] = useSearchParams()
  const sessionId = params.get('session_id')

  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [message, setMessage] = React.useState('')

  React.useEffect(() => {
    async function confirm() {
      if (!sessionId) {
        setError('No se recibió sesión de Stripe.')
        setLoading(false)
        return
      }

      try {
        const r = await PaymentAPI.confirmStripe(sessionId)
        setMessage(r.message || 'Pago confirmado correctamente.')
        window.dispatchEvent(new Event('auth-updated'))
      } catch (err) {
        setError(err.message || 'No se pudo confirmar el pago.')
      } finally {
        setLoading(false)
      }
    }

    confirm()
  }, [sessionId])

  if (loading) {
    return (
      <div className="card max-w-xl mx-auto text-center">
        Confirmando pago...
      </div>
    )
  }

  return (
    <div className="card max-w-xl mx-auto text-center">
      {error ? (
        <>
          <h1 className="text-2xl font-bold text-red-600 mb-3">
            Error al confirmar pago
          </h1>
          <p>{error}</p>
          <Link to="/pending-orders" className="btn mt-4 inline-block">
            Volver a pendientes
          </Link>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-green-600 mb-3">
            Pago completado
          </h1>
          <p>{message}</p>
          <Link to="/auctions" className="btn mt-4 inline-block">
            Ver subastas
          </Link>
        </>
      )}
    </div>
  )
}