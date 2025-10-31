import React from 'react'
import { AuthAPI } from '../lib/api.js'
import { Auth } from '../lib/auth.js'

export default function Profile(){
  const [me, setMe] = React.useState(null)
  const [bids, setBids] = React.useState([])
  const [form, setForm] = React.useState({ name:'', email:'', password:'' })
  const [saving, setSaving] = React.useState(false)

  const load = async () => {
    const r = await AuthAPI.me()
    setMe(r.user)
    setBids(r.bids || [])
    setForm({ name:r.user.name || '', email:r.user.email || '', password:'' })
  }

  React.useEffect(()=>{ load() },[])

  const onSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try{
      const payload = {}
      if (form.name !== me.name) payload.name = form.name
      if (form.email !== me.email) payload.email = form.email
      if (form.password) payload.password = form.password
      const r = await AuthAPI.updateMe(payload)
      alert('Datos actualizados')
      await load()
    }catch(e){ alert(e.message) } finally { setSaving(false) }
  }

  if (!Auth.isLogged()) return <div className="text-center">Inicia sesión</div>
  if (!me) return <div>Cargando…</div>

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <form onSubmit={onSubmit} className="card grid gap-3">
        <h2 className="text-lg font-bold">Mi perfil</h2>
        <input className="input" placeholder="Nombre" value={form.name}
          onChange={e=>setForm({...form, name:e.target.value})} />
        <input className="input" placeholder="Email" type="email" value={form.email}
          onChange={e=>setForm({...form, email:e.target.value})} />
        <input className="input" placeholder="Nueva contraseña (opcional)" type="password" value={form.password}
          onChange={e=>setForm({...form, password:e.target.value})} />
        <button className="btn" disabled={saving}>{saving?'Guardando…':'Guardar cambios'}</button>
      </form>

      <div className="card">
        <h2 className="text-lg font-bold mb-3">Historial de pujas</h2>
        <div className="space-y-2">
          {bids.length === 0 && <div className="opacity-70 text-sm">Todavía no has pujado.</div>}
          {bids.map(b=>(
            <div key={b.id} className="border rounded-xl p-3">
              <div className="font-semibold">{b.auction?.title || 'Subasta'}</div>
              <div className="text-sm">Cantidad: <b>{b.amount} €</b></div>
              <div className="text-xs opacity-70">{new Date(b.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
