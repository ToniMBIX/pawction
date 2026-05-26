import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ShippingAPI } from '../lib/api'
import { Auth } from '../lib/auth.js'

export default function PendingOrders() {
  const navigate = useNavigate()

  const [orders, setOrders] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  const load = React.useCallback(async () => {
    if (!Auth.token()) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    try {
      const r = await ShippingAPI.listPending()
      const list = Array.isArray(r) ? r : r.data || []
      setOrders(list)
    } catch (err) {
      console.error(err)
      setError(err.message || 'No se pudieron cargar los pedidos pendientes')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  React.useEffect(() => {
    const t = setInterval(() => {
      setOrders(prev =>
        prev
          .map(o => ({
            ...o,
            pay_seconds_left:
              o.pay_seconds_left > 0
                ? o.pay_seconds_left - 1
                : 0,
          }))
          .filter(o => o.pay_seconds_left > 0)
      )
    }, 1000)

    return () => clearInterval(t)
  }, [])

  if (!Auth.token()) {
    return (
      <div className="card max-w-xl mx-auto">
        <p>Debes iniciar sesión para ver tus pedidos pendientes.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-10 opacity-70">
        Cargando pedidos pendientes...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">
        Subastas pendientes de pago
      </h1>

      {error && (
        <div className="rounded-xl border border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!error && orders.length === 0 && (
        <div className="card">
          <p className="opacity-70">
            No tienes pedidos pendientes.
          </p>
        </div>
      )}

      {orders.map(a => {
        const totalSeconds = Number(a.pay_seconds_left || 0)
        const h = Math.floor(totalSeconds / 3600)
        const m = Math.floor((totalSeconds % 3600) / 60)
        const s = totalSeconds % 60

        return (
          <div key={a.id} className="card">
            <h2 className="text-xl font-bold">
              {a.title}
            </h2>

            <p className="mt-1">
              Precio final:{' '}
              <strong>{a.current_price} €</strong>
            </p>

            <p className="mt-2 text-red-600 font-bold">
              Tiempo restante para pagar:{' '}
              {h > 0 ? `${h}h ` : ''}
              {m}m {s}s
            </p>

            <button
              className="btn mt-3"
              onClick={() => navigate(`/shipping/${a.id}`)}
            >
              Completar datos de envío
            </button>
          </div>
        )
      })}
    </div>
  )
}