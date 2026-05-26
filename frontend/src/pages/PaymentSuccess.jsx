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

        setMessage(
          r.message || 'Pago confirmado correctamente.'
        )

        window.dispatchEvent(
          new Event('auth-updated')
        )
      } catch (err) {
        setError(
          err.message || 'No se pudo confirmar el pago.'
        )
      } finally {
        setLoading(false)
      }
    }

    confirm()
  }, [sessionId])

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="card p-10 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-4xl">
            ⏳
          </div>

          <h1 className="mt-6 text-3xl font-black text-slate-900">
            Confirmando pago...
          </h1>

          <p className="mt-3 text-slate-500">
            Estamos verificando la operación con Stripe.
          </p>

          <div className="mt-8 flex justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-200">
          <div className="bg-red-50 px-8 py-10 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-100 text-5xl">
              ❌
            </div>

            <h1 className="mt-6 text-4xl font-black tracking-tight text-red-700">
              Error al confirmar el pago
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-red-600">
              {error}
            </p>
          </div>

          <div className="p-8">
            <div className="rounded-3xl bg-slate-50 p-6">
              <h2 className="text-lg font-black text-slate-900">
                ¿Qué puedes hacer ahora?
              </h2>

              <div className="mt-5 space-y-4 text-sm text-slate-600">
                <div className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-700">
                    1
                  </span>

                  <p>Volver a intentarlo desde pedidos pendientes.</p>
                </div>

                <div className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-700">
                    2
                  </span>

                  <p>Comprobar si el pago se realizó correctamente en Stripe.</p>
                </div>

                <div className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-700">
                    3
                  </span>

                  <p>Intentar nuevamente el checkout.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/pending-orders"
                className="btn"
              >
                Volver a pendientes
              </Link>

              <Link
                to="/auctions"
                className="btn-secondary"
              >
                Ver subastas
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-200">
        <div className="bg-emerald-50 px-8 py-12 text-center">
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-emerald-100 text-6xl">
            ✅
          </div>

          <h1 className="mt-6 text-5xl font-black tracking-tight text-emerald-700">
            Pago completado
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-emerald-800">
            {message}
          </p>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
          <div className="p-8">
            <h2 className="text-2xl font-black text-slate-900">
              ¡Gracias por participar en Pawction!
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Tu compra ha sido registrada correctamente y recibirás un correo
              de confirmación con los detalles del pedido.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-slate-50 p-5">
                <div className="text-3xl">📦</div>

                <h3 className="mt-3 font-black text-slate-900">
                  Pedido confirmado
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Tus datos de envío ya han sido guardados.
                </p>
              </div>

              <div className="rounded-3xl bg-slate-50 p-5">
                <div className="text-3xl">📧</div>

                <h3 className="mt-3 font-black text-slate-900">
                  Correo enviado
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Recibirás la confirmación automática por email.
                </p>
              </div>

              <div className="rounded-3xl bg-slate-50 p-5">
                <div className="text-3xl">🌍</div>

                <h3 className="mt-3 font-black text-slate-900">
                  Impacto solidario
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Tu compra contribuye a iniciativas medioambientales.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/auctions"
                className="btn"
              >
                Seguir explorando
              </Link>

              <Link
                to="/pending-orders"
                className="btn-secondary"
              >
                Ver pedidos
              </Link>
            </div>
          </div>

          <aside className="bg-slate-950 p-8 text-white">
            <span className="inline-flex rounded-full bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300 ring-1 ring-emerald-400/20">
              Operación completada
            </span>

            <h2 className="mt-5 text-3xl font-black tracking-tight">
              Gracias por apoyar Pawction.
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-300">
              Cada subasta ayuda a visibilizar animales y financiar iniciativas
              solidarias y medioambientales.
            </p>

            <div className="mt-8 rounded-3xl bg-white/10 p-5">
              <div className="text-2xl font-black">
                50%
              </div>

              <p className="mt-1 text-sm text-slate-300">
                destinado a iniciativas vinculadas con Greenpeace.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}