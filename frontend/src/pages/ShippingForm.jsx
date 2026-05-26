import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ShippingAPI } from '../lib/api.js'

export default function ShippingForm() {
  const { id } = useParams()
  const nav = useNavigate()

  const [form, setForm] = React.useState({
    auction_id: id,
    full_name: '',
    address: '',
    city: '',
    province: '',
    country: '',
    postal_code: '',
    phone: '',
  })

  const [loading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState({})
  const [generalError, setGeneralError] = React.useState('')

  const fieldError = field => errors?.[field]?.[0]

  const update = (field, value) => {
    setForm({
      ...form,
      [field]: value,
    })
  }

  const onSubmit = async e => {
    e.preventDefault()

    setLoading(true)
    setErrors({})
    setGeneralError('')

    try {
      await ShippingAPI.submit({
        ...form,
        auction_id: Number(id),
      })

      nav(`/checkout/${id}`)
    } catch (e) {
      setErrors(e.errors || {})
      setGeneralError(e.message || 'Error al guardar los datos de envío')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-start">
      <form
        onSubmit={onSubmit}
        className="card p-7"
        noValidate
      >
        <div className="mb-7">
          <span className="badge badge-green">
            Datos de envío
          </span>

          <h1 className="mt-4 text-3xl font-black text-slate-900">
            ¿Dónde enviamos tu pack?
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Introduce tus datos de entrega. Después continuarás al pago seguro
            con Stripe.
          </p>
        </div>

        {generalError && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {generalError}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Nombre completo
            </label>

            <input
              className="input"
              placeholder="Nombre y apellidos"
              type="text"
              value={form.full_name}
              onChange={e => update('full_name', e.target.value)}
            />

            {fieldError('full_name') && (
              <p className="mt-2 text-sm text-red-600">
                {fieldError('full_name')}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Dirección
            </label>

            <input
              className="input"
              placeholder="Calle, número, piso..."
              type="text"
              value={form.address}
              onChange={e => update('address', e.target.value)}
            />

            {fieldError('address') && (
              <p className="mt-2 text-sm text-red-600">
                {fieldError('address')}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Ciudad
            </label>

            <input
              className="input"
              placeholder="Ciudad"
              type="text"
              value={form.city}
              onChange={e => update('city', e.target.value)}
            />

            {fieldError('city') && (
              <p className="mt-2 text-sm text-red-600">
                {fieldError('city')}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Provincia
            </label>

            <input
              className="input"
              placeholder="Provincia"
              type="text"
              value={form.province}
              onChange={e => update('province', e.target.value)}
            />

            {fieldError('province') && (
              <p className="mt-2 text-sm text-red-600">
                {fieldError('province')}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              País
            </label>

            <input
              className="input"
              placeholder="País"
              type="text"
              value={form.country}
              onChange={e => update('country', e.target.value)}
            />

            {fieldError('country') && (
              <p className="mt-2 text-sm text-red-600">
                {fieldError('country')}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Código postal
            </label>

            <input
              className="input"
              placeholder="03000"
              type="text"
              value={form.postal_code}
              onChange={e => update('postal_code', e.target.value)}
            />

            {fieldError('postal_code') && (
              <p className="mt-2 text-sm text-red-600">
                {fieldError('postal_code')}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Teléfono
            </label>

            <input
              className="input"
              placeholder="Teléfono de contacto"
              type="text"
              value={form.phone}
              onChange={e => update('phone', e.target.value)}
            />

            {fieldError('phone') && (
              <p className="mt-2 text-sm text-red-600">
                {fieldError('phone')}
              </p>
            )}
          </div>
        </div>

        <button
          className="btn mt-7 w-full py-3 text-base"
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Guardar y continuar al pago'}
        </button>
      </form>

      <aside className="space-y-5">
        <div className="rounded-[2rem] bg-slate-950 p-7 text-white shadow-2xl">
          <span className="inline-flex rounded-full bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300 ring-1 ring-emerald-400/20">
            Paso 1 de 2
          </span>

          <h2 className="mt-5 text-3xl font-black tracking-tight">
            Primero envío, después pago.
          </h2>

          <p className="mt-4 text-sm leading-7 text-slate-300">
            Guardaremos tu dirección y te redirigiremos a Stripe para completar
            el pago de forma segura.
          </p>
        </div>

        <div className="card">
          <h3 className="text-lg font-black text-slate-900">
            ¿Qué pasa después?
          </h3>

          <div className="mt-4 space-y-4 text-sm text-slate-600">
            <div className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                1
              </span>
              <p>Confirmamos tus datos de envío.</p>
            </div>

            <div className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                2
              </span>
              <p>Pasas a Stripe para realizar el pago.</p>
            </div>

            <div className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                3
              </span>
              <p>Recibirás un correo de confirmación del pedido.</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}