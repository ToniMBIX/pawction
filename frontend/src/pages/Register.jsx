import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthAPI } from '../lib/api.js'
import { Auth } from '../lib/auth.js'

export default function Register(){
  const nav = useNavigate()
  const [form, setForm] = React.useState({
    name:'', email:'', password:'', password_confirmation:''
  })
  const [loading, setLoading] = React.useState(false)
  const r = await AuthAPI.register(form)
Auth.setToken(r.token)
if (r.user) Auth.setUser(r.user)
nav('/')


  const onSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password_confirmation) {
      alert('Las contraseñas no coinciden'); return
    }
    setLoading(true)
    try {
      const r = await AuthAPI.register(form)
      Auth.setToken(r.token)
      nav('/')
    } catch(e){
      alert(e.message)
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={onSubmit} className="card max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-3">Crear cuenta</h2>

      <input className="border rounded-xl px-3 py-2 w-full mb-2" placeholder="Nombre"
        value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />

      <input className="border rounded-xl px-3 py-2 w-full mb-2" placeholder="Email" type="email"
        value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />

      <input className="border rounded-xl px-3 py-2 w-full mb-2" placeholder="Contraseña" type="password"
        value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />

      <input className="border rounded-xl px-3 py-2 w-full mb-4" placeholder="Confirmar contraseña" type="password"
        value={form.password_confirmation} onChange={e=>setForm({...form, password_confirmation:e.target.value})} />

      <button className="btn w-full" disabled={loading}>
        {loading?'Creando...':'Crear cuenta'}
      </button>

      <p className="text-sm mt-3">¿Ya tienes cuenta? <Link to="/login" className="underline">Entrar</Link></p>
    </form>
  )
}
