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
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-start">
      <section className="card p-8">
        <span className="badge badge-green">
          Pago seguro
        </span>

        <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900">
          Finalizar pago
        </h1>

        <p className="mt-3 text-slate-500">
          Vas a pagar el importe final de la subasta mediante Stripe. El pago se
          procesa de forma segura fuera de Pawction.
        </p>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 rounded-[2rem] bg-slate-50 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-2xl">
              🔒
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-900">
                Checkout protegido por Stripe
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Tus datos de tarjeta no se guardan en Pawction. Stripe procesa
                el pago y nos devuelve la confirmación automáticamente.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={pay}
          className="btn mt-8 w-full py-4 text-base"
          disabled={loading}
        >
          {loading ? 'Redirigiendo a Stripe...' : 'Pagar con Stripe'}
        </button>

        <p className="mt-4 text-center text-xs text-slate-400">
          Serás redirigido a Stripe para completar el pago.
        </p>
      </section>

      <aside className="space-y-5">
        <div className="rounded-[2rem] bg-slate-950 p-7 text-white shadow-2xl">
          <span className="inline-flex rounded-full bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300 ring-1 ring-emerald-400/20">
            Paso 2 de 2
          </span>

          <h2 className="mt-5 text-3xl font-black tracking-tight">
            Último paso para recibir tu pack.
          </h2>

          <p className="mt-4 text-sm leading-7 text-slate-300">
            Al completar el pago recibirás un correo de confirmación con los
            datos de tu compra.
          </p>
        </div>

        <div className="card">
          <h3 className="text-lg font-black text-slate-900">
            Después del pago
          </h3>

          <div className="mt-4 space-y-4 text-sm text-slate-600">
            <div className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                1
              </span>
              <p>Stripe confirma la operación.</p>
            </div>

            <div className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                2
              </span>
              <p>La subasta queda marcada como pagada.</p>
            </div>

            <div className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                3
              </span>
              <p>Recibes el correo de confirmación.</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}