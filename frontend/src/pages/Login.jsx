import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthAPI } from '../lib/api.js'
import { Auth } from '../lib/auth.js'

export default function Login() {
  const nav = useNavigate()

  const [form, setForm] = React.useState({
    email: '',
    password: '',
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
      const r = await AuthAPI.login(form)

      Auth.setToken(r.token)

      if (r.user) {
        Auth.setUser(r.user)
      }

      window.dispatchEvent(new Event('auth-updated'))

      nav('/auctions')
    } catch (e) {
      setErrors(e.errors || {})
      setGeneralError(e.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
      <section className="hidden rounded-[2rem] bg-slate-950 p-10 text-white shadow-2xl lg:block">
        <span className="inline-flex rounded-full bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300 ring-1 ring-emerald-400/20">
          Bienvenido de nuevo
        </span>

        <h1 className="mt-6 text-4xl font-black tracking-tight">
          Entra y sigue tus subastas solidarias.
        </h1>

        <p className="mt-5 leading-7 text-slate-300">
          Accede a tus favoritos, historial de pujas, pedidos pendientes y
          pagos seguros con Stripe.
        </p>

        <div className="mt-8 grid gap-3">
          <div className="rounded-3xl bg-white/10 p-5">
            <div className="text-2xl">🐾</div>
            <p className="mt-2 text-sm text-slate-300">
              Cada puja ayuda a visibilizar animales y apoyar iniciativas
              medioambientales.
            </p>
          </div>

          <div className="rounded-3xl bg-emerald-400 p-5 text-emerald-950">
            <div className="text-lg font-black">
              50% Pawction · 50% Greenpeace
            </div>
            <p className="mt-1 text-sm">
              Subastas con impacto social y ambiental.
            </p>
          </div>
        </div>
      </section>

      <form
        onSubmit={onSubmit}
        className="card mx-auto w-full max-w-md p-8"
        noValidate
      >
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-100 text-2xl">
            🐾
          </div>

          <h2 className="mt-4 text-3xl font-black text-slate-900">
            Iniciar sesión
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Accede a tu cuenta de Pawction.
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
              placeholder="Tu contraseña"
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
        </div>

        <button
          className="btn mt-6 w-full py-3 text-base"
          disabled={loading}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <p className="mt-6 text-center text-sm text-slate-500">
          ¿Sin cuenta?{' '}
          <Link
            to="/register"
            className="font-bold text-emerald-700 hover:underline"
          >
            Regístrate
          </Link>
        </p>
      </form>
    </div>
  )
}