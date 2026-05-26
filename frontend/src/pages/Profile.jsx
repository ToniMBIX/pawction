import React from 'react'
import { AuthAPI } from '../lib/api.js'
import { Auth } from '../lib/auth.js'

export default function Profile() {
  const currentUser = Auth.user()

  const [form, setForm] = React.useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    password: '',
    password_confirmation: '',
  })

  const [loading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState({})
  const [generalError, setGeneralError] = React.useState('')
  const [success, setSuccess] = React.useState('')

  const fieldError = field => errors?.[field]?.[0]

  const onSubmit = async e => {
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

  const initials = (form.name || 'Usuario')
    .split(' ')
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-400 text-3xl font-black text-emerald-950">
            {initials}
          </div>

          <div>
            <span className="inline-flex rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/20">
              Mi cuenta
            </span>

            <h1 className="mt-3 text-3xl font-black tracking-tight">
              {form.name || 'Usuario Pawction'}
            </h1>

            <p className="mt-1 text-sm text-slate-300">
              Gestiona tus datos personales y credenciales de acceso.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1fr_0.8fr]" noValidate>
        <section className="card p-7">
          <h2 className="text-xl font-black text-slate-900">
            Datos personales
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Esta información se usa para identificar tu cuenta.
          </p>

          {generalError && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {generalError}
            </div>
          )}

          {success && (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {success}
            </div>
          )}

          <div className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Nombre
              </label>

              <input
                className="input"
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />

              {fieldError('name') && (
                <p className="mt-2 text-sm text-red-600">
                  {fieldError('name')}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email
              </label>

              <input
                className="input"
                type="text"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />

              {fieldError('email') && (
                <p className="mt-2 text-sm text-red-600">
                  {fieldError('email')}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="card p-7">
          <h2 className="text-xl font-black text-slate-900">
            Seguridad
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Deja la contraseña vacía si no quieres cambiarla.
          </p>

          <div className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Nueva contraseña
              </label>

              <input
                className="input"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={form.password}
                onChange={e =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
              />

              {fieldError('password') && (
                <p className="mt-2 text-sm text-red-600">
                  {fieldError('password')}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Confirmar nueva contraseña
              </label>

              <input
                className="input"
                type="password"
                placeholder="Repite la contraseña"
                value={form.password_confirmation}
                onChange={e =>
                  setForm({
                    ...form,
                    password_confirmation: e.target.value,
                  })
                }
              />

              {fieldError('password_confirmation') && (
                <p className="mt-2 text-sm text-red-600">
                  {fieldError('password_confirmation')}
                </p>
              )}
            </div>

            <button className="btn w-full py-3 text-base" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </section>
      </form>
    </div>
  )
}