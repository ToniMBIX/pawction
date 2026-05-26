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

  const fieldError = (field) => errors?.[field]?.[0]

  const onSubmit = async (e) => {
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

  const update = (field, value) => {
    setForm({
      ...form,
      [field]: value,
    })
  }

  return (
    <form onSubmit={onSubmit} className="card max-w-xl mx-auto" noValidate>
      <h2 className="text-xl font-bold mb-3">Datos de envío</h2>

      {generalError && (
        <div className="mb-3 rounded-xl border border-red-500 bg-red-50 px-3 py-2 text-sm text-red-700">
          {generalError}
        </div>
      )}

      <div className="mb-3">
        <input
          className="border rounded-xl px-3 py-2 w-full"
          placeholder="Nombre completo"
          type="text"
          value={form.full_name}
          onChange={(e) => update('full_name', e.target.value)}
        />
        {fieldError('full_name') && (
          <p className="mt-1 text-sm text-red-600">{fieldError('full_name')}</p>
        )}
      </div>

      <div className="mb-3">
        <input
          className="border rounded-xl px-3 py-2 w-full"
          placeholder="Dirección"
          type="text"
          value={form.address}
          onChange={(e) => update('address', e.target.value)}
        />
        {fieldError('address') && (
          <p className="mt-1 text-sm text-red-600">{fieldError('address')}</p>
        )}
      </div>

      <div className="mb-3">
        <input
          className="border rounded-xl px-3 py-2 w-full"
          placeholder="Ciudad"
          type="text"
          value={form.city}
          onChange={(e) => update('city', e.target.value)}
        />
        {fieldError('city') && (
          <p className="mt-1 text-sm text-red-600">{fieldError('city')}</p>
        )}
      </div>

      <div className="mb-3">
        <input
          className="border rounded-xl px-3 py-2 w-full"
          placeholder="Provincia"
          type="text"
          value={form.province}
          onChange={(e) => update('province', e.target.value)}
        />
        {fieldError('province') && (
          <p className="mt-1 text-sm text-red-600">{fieldError('province')}</p>
        )}
      </div>

      <div className="mb-3">
        <input
          className="border rounded-xl px-3 py-2 w-full"
          placeholder="País"
          type="text"
          value={form.country}
          onChange={(e) => update('country', e.target.value)}
        />
        {fieldError('country') && (
          <p className="mt-1 text-sm text-red-600">{fieldError('country')}</p>
        )}
      </div>

      <div className="mb-3">
        <input
          className="border rounded-xl px-3 py-2 w-full"
          placeholder="Código postal"
          type="text"
          value={form.postal_code}
          onChange={(e) => update('postal_code', e.target.value)}
        />
        {fieldError('postal_code') && (
          <p className="mt-1 text-sm text-red-600">
            {fieldError('postal_code')}
          </p>
        )}
      </div>

      <div className="mb-3">
        <input
          className="border rounded-xl px-3 py-2 w-full"
          placeholder="Teléfono"
          type="text"
          value={form.phone}
          onChange={(e) => update('phone', e.target.value)}
        />
        {fieldError('phone') && (
          <p className="mt-1 text-sm text-red-600">{fieldError('phone')}</p>
        )}
      </div>

      <button className="btn w-full" disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar y continuar al pago'}
      </button>
    </form>
  )
}