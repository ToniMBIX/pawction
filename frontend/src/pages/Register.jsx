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
    password_confirmation: ''
  })
  const [loading, setLoading] = React.useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const r = await AuthAPI.register(form)
      if (r.token) {
        Auth.setToken(r.token)
        nav('/')
      } else {
        alert('Error: no se recibió token del servidor')
      }
    } catch (e) {
      console.error(e)
      alert(e.message || 'Error al registrar usuario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="card max-w-md mx-auto p-6 shadow rounded-2xl bg-white">
      <h2 className="text-xl font-bold mb-4">Crear cuenta</h2>

      <input
        className="border rounded-xl px-3 py-2 w-full mb-2"
        placeholder="Nombre"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
        required
      />

      <input
        className="border rounded-xl px-3 py-2 w-full mb-2"
        placeholder="Email"
        type="email"
        value={form.email}
        onChange={e => setForm({ ...form, email: e.target.value })}
        required
      />

      <input
        className="border rounded-xl px-3 py-2 w-full mb-2"
        placeholder="Contraseña"
        type="password"
        value={form.password}
        onChange={e => setForm({ ...form, password: e.target.value })}
        required
      />

      <input
        className="border rounded-xl px-3 py-2 w-full mb-4"
        placeholder="Confirmar contraseña"
        type="password"
        value={form.password_confirmation}
        onChange={e => setForm({ ...form, password_confirmation: e.target.value })}
        required
      />

      <button className="btn w-full" disabled={loading}>
        {loading ? 'Creando...' : 'Crear cuenta'}
      </button>

      <p className="text-sm mt-3 text-center">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="underline">
          Entrar
        </Link>
      </p>
    </form>
  )
}
