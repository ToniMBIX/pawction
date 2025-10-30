import React from 'react'
import { AdminAPI } from '../lib/api.js'
import { Auth } from '../lib/auth'

export default function AdminAuctions(){
  const [items, setItems] = React.useState([])
  const [form, setForm] = React.useState({
    title: '',
    description: '',
    image_url: '',
    // opción 1: usar product existente
    product_id: '',
    // opción 2: crear animal+pack al vuelo
    animal: { name: '', species: 'Perro', age: '', photo_url: '', info_url: '' }
  })

  const load = async () => {
    const r = await AdminAPI.auctions.list()
    setItems(Array.isArray(r) ? r : (r.data || []))
  }

  React.useEffect(()=>{ load() },[])

  const create = async (e) => {
    e.preventDefault()
    const payload = {
      title: form.title,
      description: form.description || null,
      image_url: form.image_url || null,
    }
    if (form.product_id) payload.product_id = Number(form.product_id)
    else if (form.animal.name) payload.animal = {
      name: form.animal.name,
      species: form.animal.species || 'Perro',
      age: form.animal.age ? Number(form.animal.age) : null,
      photo_url: form.animal.photo_url || null,
      info_url: form.animal.info_url || null
    }

    await AdminAPI.auctions.create(payload)
    setForm({ title:'', description:'', image_url:'', product_id:'', animal:{ name:'', species:'Perro', age:'', photo_url:'', info_url:'' }})
    await load()
  }

  const remove = async (id) => {
    if (!confirm('¿Eliminar subasta?')) return
    await AdminAPI.auctions.remove(id)
    setItems(items.filter(x=>x.id!==id))
  }

  // Gate muy simple: no muestres si no hay token
if (!Auth.token() || !Auth.isAdmin()) {
  return <div className="text-center">Debes iniciar sesión como admin.</div>
}

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gestión de subastas</h1>

      <form onSubmit={create} className="card grid gap-3">
        <h2 className="font-semibold">Crear subasta</h2>
        <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})}
          className="input" placeholder="Título" required />
        <textarea value={form.description} onChange={e=>setForm({...form, description:e.target.value})}
          className="input" placeholder="Descripción (opcional)" />
        <input value={form.image_url} onChange={e=>setForm({...form, image_url:e.target.value})}
          className="input" placeholder="Imagen URL (opcional)" />

        <div className="grid md:grid-cols-2 gap-3">
          <input value={form.product_id} onChange={e=>setForm({...form, product_id:e.target.value})}
            className="input" placeholder="product_id (opcional si creas el animal)" />
          <div className="text-sm opacity-70 self-center">O rellena datos del animal para crear el pack</div>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <input value={form.animal.name} onChange={e=>setForm({...form, animal:{...form.animal, name:e.target.value}})}
            className="input" placeholder="Animal nombre (para crear pack)" />
          <input value={form.animal.photo_url} onChange={e=>setForm({...form, animal:{...form.animal, photo_url:e.target.value}})}
            className="input" placeholder="Animal photo_url" />
          <input value={form.animal.species} onChange={e=>setForm({...form, animal:{...form.animal, species:e.target.value}})}
            className="input" placeholder="Especie (Perro/Gato...)" />
          <input value={form.animal.age} onChange={e=>setForm({...form, animal:{...form.animal, age:e.target.value}})}
            className="input" placeholder="Edad" />
          <input value={form.animal.info_url} onChange={e=>setForm({...form, animal:{...form.animal, info_url:e.target.value}})}
            className="input" placeholder="Info URL" />
        </div>

        <button className="btn w-full">Crear subasta</button>
      </form>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map(a=>(
          <div key={a.id} className="card">
            <img src={a?.product?.animal?.photo_url || a?.image_url || '/placeholder.jpg'} className="w-full h-40 object-cover rounded-xl" />
            <div className="mt-2">
              <div className="font-semibold">{a.title}</div>
              <div className="text-sm opacity-80">Actual: {a.current_price} €</div>
              <div className="text-xs opacity-60">Estado: {a.status}</div>
              <button onClick={()=>remove(a.id)} className="btn mt-2 w-full">Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
