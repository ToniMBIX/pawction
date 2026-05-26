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
              o.pay_seconds_left > 0 ? o.pay_seconds_left - 1 : 0,
          }))
          .filter(o => o.pay_seconds_left > 0)
      )
    }, 1000)

    return () => clearInterval(t)
  }, [])

  if (!Auth.token()) {
    return (
      <div className="card mx-auto max-w-xl text-center">
        Debes iniciar sesión para ver tus pedidos pendientes.
      </div>
    )
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        {[1, 2].map(i => (
          <div key={i} className="card animate-pulse">
            <div className="h-6 w-2/3 rounded bg-slate-200" />
            <div className="mt-4 h-4 w-1/3 rounded bg-slate-200" />
            <div className="mt-5 h-12 rounded-2xl bg-slate-200" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <span className="badge badge-orange">
          Pendientes de pago
        </span>

        <h1 className="mt-4 page-title">
          Subastas ganadas
        </h1>

        <p className="mt-2 max-w-2xl text-slate-500">
          Completa los datos de envío y realiza el pago antes de que termine el
          plazo para conservar tu pack solidario.
        </p>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {!error && orders.length === 0 && (
        <div className="card text-center">
          <div className="text-5xl">✅</div>

          <h2 className="mt-4 text-xl font-black text-slate-900">
            No tienes pagos pendientes
          </h2>

          <p className="mt-2 text-slate-500">
            Cuando ganes una subasta aparecerá aquí para completar el envío y
            pagar con Stripe.
          </p>

          <button
            className="btn mt-5"
            onClick={() => navigate('/auctions')}
          >
            Ver subastas
          </button>
        </div>
      )}

      {orders.length > 0 && (
        <div className="grid gap-5">
          {orders.map(a => {
            const totalSeconds = Number(a.pay_seconds_left || 0)
            const h = Math.floor(totalSeconds / 3600)
            const m = Math.floor((totalSeconds % 3600) / 60)
            const s = totalSeconds % 60

            const timeLabel = `${h > 0 ? `${h}h ` : ''}${m}m ${s}s`

            const urgent = totalSeconds < 3600

            return (
              <div
                key={a.id}
                className="card overflow-hidden p-0"
              >
                <div className="grid gap-0 md:grid-cols-[1fr_280px]">
                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="badge badge-green">
                        Ganada
                      </span>

                      <span
                        className={`badge ${
                          urgent ? 'badge-red' : 'badge-orange'
                        }`}
                      >
                        {urgent ? 'Urgente' : 'En plazo'}
                      </span>
                    </div>

                    <h2 className="mt-4 text-2xl font-black text-slate-900">
                      {a.title}
                    </h2>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-3xl bg-slate-50 p-5">
                        <p className="text-xs font-medium text-slate-500">
                          Precio final
                        </p>

                        <p className="mt-1 text-3xl font-black text-slate-900">
                          {a.current_price} €
                        </p>
                      </div>

                      <div
                        className={`rounded-3xl p-5 ${
                          urgent
                            ? 'bg-red-50 text-red-700'
                            : 'bg-orange-50 text-orange-700'
                        }`}
                      >
                        <p className="text-xs font-medium">
                          Tiempo restante
                        </p>

                        <p className="mt-1 text-3xl font-black">
                          {timeLabel}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center bg-slate-950 p-6 text-white">
                    <p className="text-sm text-slate-300">
                      Para conservar tu pack, completa el envío y realiza el
                      pago seguro con Stripe.
                    </p>

                    <button
                      className="mt-5 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold text-emerald-950 transition hover:bg-emerald-400"
                      onClick={() => navigate(`/shipping/${a.id}`)}
                    >
                      Completar envío y pagar
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}