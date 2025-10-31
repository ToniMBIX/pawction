import React from 'react'
import { AuthAPI } from '../lib/api.js'

export default function Profile(){
  const [me, setMe] = React.useState(null)
  const [form, setForm] = React.useState({ name:'', email:'', password:'', password_confirmation:'' })
  const [loading, setLoading] = React.useState(true)

  React.useEffect(()=>{
    (async ()=>{
      try{
        const u = await AuthAPI.me()
        setMe(u)
        setForm({ name: u?.name || '', email: u?.email || '', password:'', password_confirmation:'' })
      } catch {
        setMe(null)
      } finally {
        setLoading(false)
      }
    })()
  },[])

  if (loading) return <div>Cargando…</div>
  if (!me)     return <div>No estás autenticado.</div>

  const onSubmit = async (e) => {
    e.preventDefault()
    const payload = { name: form.name, email: form.email }
    if (form.password) {
      payload.password = form.password
      payload.password_confirmation = form.password_confirmation
    }
    const updated = await fetch(import.meta.env.VITE_API_URL + '/me', {
      method:'PUT',
      headers:{ 'Content-Type':'application/json', 'Accept':'application/json', 'Authorization':'Bearer '+localStorage.getItem('auth_token') },
      body: JSON.stringify(payload)
    }).then(r=>r.json())

    setMe(updated)
    // si guardas en local:
    const local = JSON.parse(localStorage.getItem('auth_user') || '{}')
    localStorage.setItem('auth_user', JSON.stringify({...local, ...updated}))
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <form onSubmit={onSubmit} className="card">
        <h2 className="font-bold text-lg mb-3">Mi perfil</h2>
        <input className="input mb-2" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="Nombre" />
        <input className="input mb-2" type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} placeholder="Email" />
        <input className="input mb-2" type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} placeholder="Nueva contraseña (opcional)" />
        <input className="input mb-2" type="password" value={form.password_confirmation} onChange={e=>setForm({...form, password_confirmation:e.target.value})} placeholder="Confirmar contraseña" />
        <button className="btn">Guardar</button>
      </form>

      <div className="card">
        <h2 className="font-bold text-lg mb-3">Mis favoritos</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {(me.favorites || []).map(a=>(
            <div key={a.id} className="border rounded-xl p-3">
              <img src={a?.product?.animal?.photo_url || a?.image_url || '/placeholder.jpg'} className="w-full h-32 object-cover rounded-lg" />
              <div className="mt-2 font-semibold">{a.title}</div>
              <div className="text-sm opacity-70">{a.current_price} €</div>
            </div>
          ))}
          {(me.favorites || []).length === 0 && <div className="opacity-70 text-sm">Aún no tienes favoritos.</div>}
        </div>
      </div>
    </div>
  )
}
