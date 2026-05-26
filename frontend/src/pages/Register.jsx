import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthAPI } from '../lib/api.js'
import { Auth } from '../lib/auth.js'

export default function Register() {
  const nav = useNavigate()

  const [form, setForm] = React.useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })

  const [loading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState({})
  const [generalError, setGeneralError] = React.useState('')

  const fieldError = field => errors?.[field]?.[0]

  const onSubmit = async e => {
    e.preventDefault()

    setLoading(true)
    setErrors({})
    setGeneralError('')

    try {
      const r = await AuthAPI.register(form)

      Auth.setToken(r.token)

      if (r.user) {
        Auth.setUser(r.user)
      }

      window.dispatchEvent(new Event('auth-updated'))

      nav('/auctions')
    } catch (e) {
      setErrors(e.errors || {})
      setGeneralError(e.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.9fr_1fr] lg:items-center">
      <form
        onSubmit={onSubmit}
        className="card mx-auto w-full max-w-md p-8"
        noValidate
      >
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-100 text-2xl">
            🌱
          </div>

          <h2 className="mt-4 text-3xl font-black text-slate-900">
            Crear cuenta
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Únete a Pawction y empieza a participar en subastas solidarias.
          </p>
        </div>

        {generalError && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {generalError}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Nombre
            </label>

            <input
              className="input"
              placeholder="Tu nombre"
              type="text"
              value={form.name}
              onChange={e =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
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
              placeholder="tu@email.com"
              type="text"
              value={form.email}
              onChange={e =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
            />

            {fieldError('email') && (
              <p className="mt-2 text-sm text-red-600">
                {fieldError('email')}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Contraseña
            </label>

            <input
              className="input"
              placeholder="Mínimo 8 caracteres"
              type="password"
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
              Confirmar contraseña
            </label>

            <input
              className="input"
              placeholder="Repite tu contraseña"
              type="password"
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
        </div>

        <button
          className="btn mt-6 w-full py-3 text-base"
          disabled={loading}
        >
          {loading ? 'Creando cuenta...' : 'Registrarme'}
        </button>

        <p className="mt-6 text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{' '}
          <Link
            to="/login"
            className="font-bold text-emerald-700 hover:underline"
          >
            Entra
          </Link>
        </p>
      </form>

      <section className="hidden rounded-[2rem] bg-slate-950 p-10 text-white shadow-2xl lg:block">
        <span className="inline-flex rounded-full bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300 ring-1 ring-emerald-400/20">
          Únete al impacto
        </span>

        <h1 className="mt-6 text-4xl font-black tracking-tight">
          Participa en subastas que ayudan de verdad.
        </h1>

        <p className="mt-5 leading-7 text-slate-300">
          Crea tu cuenta para pujar por packs solidarios, guardar favoritos,
          seguir tus pedidos y completar pagos seguros con Stripe.
        </p>

        <div className="mt-8 grid gap-3">
          <div className="rounded-3xl bg-white/10 p-5">
            <div className="text-2xl">🔒</div>

            <p className="mt-2 text-sm text-slate-300">
              Registro seguro, validación backend y pagos protegidos.
            </p>
          </div>

          <div className="rounded-3xl bg-emerald-400 p-5 text-emerald-950">
            <div className="text-lg font-black">
              Subastas con propósito
            </div>

            <p className="mt-1 text-sm">
              Cada pack conecta diseño, adopción y apoyo medioambiental.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}