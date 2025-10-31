import React from 'react'
import { AuthAPI } from '../lib/api.js'
import { Auth } from '../lib/auth.js'

export default function Profile(){
  const [form, setForm] = React.useState({ name:'', email:'', password:'', password_confirmation:'' })
  const [loading, setLoading] = React.useState(true)

  React.useEffect(()=>{
    (async ()=>{
      try{
        const u = await AuthAPI.me()
        setForm({ name: u?.name || '', email: u?.email || '', password:'', password_confirmation:'' })
      } catch {
        // si no autenticado
      } finally {
        setLoading(false)
      }
    })()
  },[])

  if (!Auth.token()) return <div>Debes iniciar sesión.</div>
  if (loading) return <div>Cargando…</div>

  const onSubmit = async (e) => {
    e.preventDefault()
    const payload = { name: form.name, email: form.email }
    if (form.password) {
      payload.password = form.password
      payload.password_confirmation = form.password_confirmation
    }
    const updated = await fetch((import.meta.env.VITE_API_URL || 'https://pawction-backend.onrender.com/api') + '/me', {
      method:'PUT',
      headers:{ 'Content-Type':'application/json', 'Accept':'application/json', 'Authorization':'Bearer '+Auth.token() },
      body: JSON.stringify(payload)
    }).then(r=>r.json())

    Auth.setUser(updated) // guarda en local
    alert('Datos actualizados')
  }

  return (
    <form onSubmit={onSubmit} className="card max-w-lg">
      <h2 className="font-bold text-lg mb-3">Mi perfil</h2>
      <input className="input mb-2" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="Nombre" />
      <input className="input mb-2" type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} placeholder="Email" />
      <input className="input mb-2" type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} placeholder="Nueva contraseña (opcional)" />
      <input className="input mb-4" type="password" value={form.password_confirmation} onChange={e=>setForm({...form, password_confirmation:e.target.value})} placeholder="Confirmar contraseña" />
      <button className="btn">Guardar</button>
    </form>
  )
}
