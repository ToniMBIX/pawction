// frontend/src/pages/AdminAuctions.jsx
import React from 'react'
import { AdminAPI } from '../lib/api.js'
import { Auth } from '../lib/auth.js'

export default function AdminAuctions(){
  const [items, setItems] = React.useState([])
  const [form, setForm] = React.useState({
    title: '',
    description: '',
    image_url: '',
    image_file: null, // <-- NUEVO
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

    const fd = new FormData()
    fd.append('title', form.title)
    if (form.description) fd.append('description', form.description)

    // Si subes archivo, lo mandamos como 'image'
    if (form.image_file) {
      fd.append('image', form.image_file)
    } else if (form.image_url) {
      // si quieres seguir permitiendo URL
      fd.append('image_url', form.image_url)
    }

    if (form.product_id) {
      fd.append('product_id', String(form.product_id))
    } else if (form.animal.name) {
      fd.append('animal[name]', form.animal.name)
      if (form.animal.species)   fd.append('animal[species]', form.animal.species)
      if (form.animal.age)       fd.append('animal[age]', String(form.animal.age))
      if (form.animal.photo_url) fd.append('animal[photo_url]', form.animal.photo_url)
      if (form.animal.info_url)  fd.append('animal[info_url]', form.animal.info_url)
    }

    await AdminAPI.auctions.create(fd)

    setForm({
      title:'',
      description:'',
      image_url:'',
      image_file:null,
      product_id:'',
      animal:{ name:'', species:'Perro', age:'', photo_url:'', info_url:'' }
    })

    await load()
  }

  const remove = async (id) => {
    if (!confirm('¿Eliminar subasta?')) return
    await AdminAPI.auctions.remove(id)
    setItems(items.filter(x=>x.id!==id))
  }

  // Gate muy simple: solo admin
  if (!Auth.token() || !Auth.isAdmin()) {
    return <div className="text-center">Debes iniciar sesión como admin.</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gestión de subastas</h1>

      <form onSubmit={create} className="card grid gap-3">
        <h2 className="font-semibold">Crear subasta</h2>

        <input
          value={form.title}
          onChange={e=>setForm({...form, title:e.target.value})}
          className="input"
          placeholder="Título"
          required
        />

        <textarea
          value={form.description}
          onChange={e=>setForm({...form, description:e.target.value})}
          className="input"
          placeholder="Descripción (opcional)"
        />

        {/* Campo URL opcional */}
        <input
          value={form.image_url}
          onChange={e=>setForm({...form, image_url:e.target.value})}
          className="input"
          placeholder="Imagen URL (opcional si no subes archivo)"
        />

        {/* Campo archivo imagen */}
        <input
          type="file"
          accept="image/*"
          onChange={e=>{
            const file = e.target.files?.[0] || null
            setForm(f => ({ ...f, image_file: file }))
          }}
          className="input"
        />

        <div className="grid md:grid-cols-2 gap-3">
          <input
            value={form.product_id}
            onChange={e=>setForm({...form, product_id:e.target.value})}
            className="input"
            placeholder="product_id (opcional si creas el animal)"
          />
          <div className="text-sm opacity-70 self-center">
            O rellena datos del animal para crear el pack
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <input
            value={form.animal.name}
            onChange={e=>setForm({...form, animal:{...form.animal, name:e.target.value}})}
            className="input"
            placeholder="Animal nombre (para crear pack)"
          />
          <input
            value={form.animal.photo_url}
            onChange={e=>setForm({...form, animal:{...form.animal, photo_url:e.target.value}})}
            className="input"
            placeholder="Animal photo_url"
          />
          <input
            value={form.animal.species}
            onChange={e=>setForm({...form, animal:{...form.animal, species:e.target.value}})}
            className="input"
            placeholder="Especie (Perro/Gato...)"
          />
          <input
            value={form.animal.age}
            onChange={e=>setForm({...form, animal:{...form.animal, age:e.target.value}})}
            className="input"
            placeholder="Edad"
          />
          <input
            value={form.animal.info_url}
            onChange={e=>setForm({...form, animal:{...form.animal, info_url:e.target.value}})}
            className="input"
            placeholder="Info URL"
          />
        </div>

        <button className="btn w-full">Crear subasta</button>
      </form>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map(a=>(
          <div key={a.id} className="card">
            <img
              src={a?.product?.animal?.photo_url || a?.image_url || '/placeholder.jpg'}
              className="w-full h-40 object-cover rounded-xl"
            />
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
