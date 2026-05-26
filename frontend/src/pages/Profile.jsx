import React from 'react'
import { AuthAPI } from '../lib/api.js'
import { Auth } from '../lib/auth.js'

export default function Profile() {
  const [form, setForm] = React.useState({
    name: Auth.user()?.name || '',
    email: Auth.user()?.email || '',
    password: '',
    password_confirmation: '',
  })

  const [loading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState({})
  const [generalError, setGeneralError] = React.useState('')
  const [success, setSuccess] = React.useState('')

  const fieldError = (field) => errors?.[field]?.[0]

  const onSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)
    setErrors({})
    setGeneralError('')
    setSuccess('')

    try {
      const payload = {
        name: form.name,
        email: form.email,
      }

      if (form.password) {
        payload.password = form.password
        payload.password_confirmation = form.password_confirmation
      }

      const r = await AuthAPI.update(payload)

      if (r.user) {
        Auth.setUser(r.user)
      }

      window.dispatchEvent(new Event('auth-updated'))

      setSuccess('Perfil actualizado correctamente')
      setForm({
        name: r.user?.name || form.name,
        email: r.user?.email || form.email,
        password: '',
        password_confirmation: '',
      })
    } catch (e) {
      setErrors(e.errors || {})
      setGeneralError(e.message || 'No se pudo actualizar el perfil')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="card max-w-xl mx-auto" noValidate>
      <h2 className="text-xl font-bold mb-3">Mi perfil</h2>

      {generalError && (
        <div className="mb-3 rounded-xl border border-red-500 bg-red-50 px-3 py-2 text-sm text-red-700">
          {generalError}
        </div>
      )}

      {success && (
        <div className="mb-3 rounded-xl border border-green-500 bg-green-50 px-3 py-2 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="mb-3">
        <label className="mb-1 block text-sm font-medium">Nombre</label>
        <input
          className="border rounded-xl px-3 py-2 w-full"
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        {fieldError('name') && (
          <p className="mt-1 text-sm text-red-600">{fieldError('name')}</p>
        )}
      </div>

      <div className="mb-3">
        <label className="mb-1 block text-sm font-medium">Email</label>
        <input
          className="border rounded-xl px-3 py-2 w-full"
          type="text"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        {fieldError('email') && (
          <p className="mt-1 text-sm text-red-600">{fieldError('email')}</p>
        )}
      </div>

      <hr className="my-4" />

      <p className="mb-3 text-sm opacity-70">
        Deja la contraseña vacía si no quieres cambiarla.
      </p>

      <div className="mb-3">
        <label className="mb-1 block text-sm font-medium">Nueva contraseña</label>
        <input
          className="border rounded-xl px-3 py-2 w-full"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        {fieldError('password') && (
          <p className="mt-1 text-sm text-red-600">{fieldError('password')}</p>
        )}
      </div>

      <div className="mb-3">
        <label className="mb-1 block text-sm font-medium">
          Confirmar nueva contraseña
        </label>
        <input
          className="border rounded-xl px-3 py-2 w-full"
          type="password"
          value={form.password_confirmation}
          onChange={(e) =>
            setForm({ ...form, password_confirmation: e.target.value })
          }
        />

        {fieldError('password_confirmation') && (
          <p className="mt-1 text-sm text-red-600">
            {fieldError('password_confirmation')}
          </p>
        )}
      </div>

      <button className="btn w-full" disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}