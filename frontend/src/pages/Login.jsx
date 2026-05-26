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

  const onSubmit = async (e) => {
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

  const fieldError = (field) => {
    return errors?.[field]?.[0]
  }

  return (
    <form onSubmit={onSubmit} className="card max-w-md mx-auto" noValidate>
      <h2 className="text-xl font-bold mb-3">Iniciar sesión</h2>

      {generalError && (
        <div className="mb-3 rounded-xl border border-red-500 bg-red-50 px-3 py-2 text-sm text-red-700">
          {generalError}
        </div>
      )}

      <div className="mb-3">
        <input
          className="border rounded-xl px-3 py-2 w-full"
          placeholder="Email"
          type="text"
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
        />

        {fieldError('email') && (
          <p className="mt-1 text-sm text-red-600">
            {fieldError('email')}
          </p>
        )}
      </div>

      <div className="mb-3">
        <input
          className="border rounded-xl px-3 py-2 w-full"
          placeholder="Contraseña"
          type="password"
          value={form.password}
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value,
            })
          }
        />

        {fieldError('password') && (
          <p className="mt-1 text-sm text-red-600">
            {fieldError('password')}
          </p>
        )}
      </div>

      <button className="btn w-full" disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar'}
      </button>

      <p className="text-sm mt-3">
        ¿Sin cuenta?{' '}
        <Link to="/register" className="underline">
          Regístrate
        </Link>
      </p>
    </form>
  )
}