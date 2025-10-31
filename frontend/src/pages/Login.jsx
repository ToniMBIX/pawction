import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthAPI } from '../lib/api.js'
import { Auth } from '../lib/auth.js'

export default function Login(){
  const nav = useNavigate()
  const [form, setForm] = React.useState({ email:'', password:'' })
  const [loading, setLoading] = React.useState(false)
  const r = await AuthAPI.login(form)
Auth.setToken(r.token)
if (r.user) Auth.setUser(r.user)
nav('/')


  const onSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const r  = await AuthAPI.login(form)  // { token }
      Auth.setToken(r.token)
      const me = await AuthAPI.me()         // { id, name, email, is_admin, ... }
      Auth.setUser(me)
      nav('/')
    } catch(e){ alert(e.message) } finally { setLoading(false) }
  }

  return (
    <form onSubmit={onSubmit} className="card max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-3">Iniciar sesión</h2>
      <input className="border rounded-xl px-3 py-2 w-full mb-2" placeholder="Email" type="email"
        value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
      <input className="border rounded-xl px-3 py-2 w-full mb-2" placeholder="Contraseña" type="password"
        value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
      <button className="btn w-full" disabled={loading}>{loading?'Entrando...':'Entrar'}</button>
      <p className="text-sm mt-3">¿Sin cuenta? <Link to="/register" className="underline">Regístrate</Link></p>
    </form>
  )
}
