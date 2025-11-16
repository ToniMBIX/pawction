// frontend/src/pages/AdminAuctions.jsx
import React from 'react'
import { AdminAPI, assetUrl } from '../lib/api.js'
import { Auth } from '../lib/auth.js'

export default function AdminAuctions(){
  const [items, setItems] = React.useState([])
  const [form, setForm] = React.useState({
    title: '',
    description: '',
    image_url: '',
    image_file: null,
    product_id: '',
    animal: { name: '', species: 'Perro', age: '', photo_url: '', info_url: '' }
  })

  const load = async () => {
    try {
      const r = await AdminAPI.auctions.list()
      setItems(Array.isArray(r) ? r : (r.data || []))
    } catch (e) {
      console.error('Error cargando subastas admin', e)
    }
  }

  React.useEffect(()=>{ load() },[])

  const create = async (e) => {
    e.preventDefault()

    if (!form.title.trim()) {
      alert('El título es obligatorio')
      return
    }

    const fd = new FormData()
    fd.append('title', form.title.trim())
    if (form.description.trim()) fd.append('description', form.description.trim())

    if (form.image_file) {
      fd.append('image', form.image_file)
    } else if (form.image_url.trim()) {
      fd.append('image_url', form.image_url.trim())
    }

    if (form.product_id.trim()) {
      fd.append('product_id', form.product_id.trim())
    } else if (form.animal.name.trim()) {
      fd.append('animal[name]', form.animal.name.trim())
      if (form.animal.species.trim())   fd.append('animal[species]', form.animal.species.trim())
      if (form.animal.age)              fd.append('animal[age]', String(form.animal.age))
      if (form.animal.photo_url.trim()) fd.append('animal[photo_url]', form.animal.photo_url.trim())
      if (form.animal.info_url.trim())  fd.append('animal[info_url]', form.animal.info_url.trim())
    }

    try {
      await AdminAPI.auctions.create(fd)
      setForm({
        title: '',
        description: '',
        image_url: '',
        image_file: null,
        product_id: '',
        animal: { name: '', species: 'Perro', age: '', photo_url: '', info_url: '' }
      })
      await load()
    } catch (err) {
      alert(err.message || 'Error creando la subasta')
      console.error(err)
    }
  }

  const remove = async (id) => {
    if (!confirm('¿Eliminar subasta?')) return
    try {
      await AdminAPI.auctions.remove(id)
      setItems(items.filter(x=>x.id!==id))
    } catch (e) {
      alert('No se pudo eliminar')
      console.error(e)
    }
  }

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

        <input
          value={form.image_url}
          onChange={e=>setForm({...form, image_url:e.target.value})}
          className="input"
          placeholder="Imagen URL (opcional si no subes archivo)"
        />

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
            O rellena datos del animal para crear el pack automáticamente
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <input
            value={form.animal.name}
            onChange={e=>setForm({
              ...form,
              animal:{...form.animal, name:e.target.value}
            })}
            className="input"
            placeholder="Animal nombre (para crear pack)"
          />
          <input
            value={form.animal.photo_url}
            onChange={e=>setForm({
              ...form,
              animal:{...form.animal, photo_url:e.target.value}
            })}
            className="input"
            placeholder="Animal photo_url"
          />
          <input
            value={form.animal.species}
            onChange={e=>setForm({
              ...form,
              animal:{...form.animal, species:e.target.value}
            })}
            className="input"
            placeholder="Especie (Perro/Gato...)"
          />
          <input
            value={form.animal.age}
            onChange={e=>setForm({
              ...form,
              animal:{...form.animal, age:e.target.value}
            })}
            className="input"
            placeholder="Edad"
          />
          <input
            value={form.animal.info_url}
            onChange={e=>setForm({
              ...form,
              animal:{...form.animal, info_url:e.target.value}
            })}
            className="input"
            placeholder="Info URL"
          />
        </div>

        <button className="btn w-full">Crear subasta</button>
      </form>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map(a=>{
          const raw =
            a?.product?.animal?.photo_url ||
            a?.image_url ||
            a?.photo_url

          const img = assetUrl(raw) || '/placeholder.jpg'

          return (
            <div key={a.id} className="card">
              <img
                src={img}
                className="w-full h-40 object-cover rounded-xl"
                alt=""
                onError={ev => { ev.currentTarget.src = '/placeholder.jpg' }}
              />
              <div className="mt-2">
                <div className="font-semibold">{a.title}</div>
                <div className="text-sm opacity-80">Actual: {a.current_price} €</div>
                <div className="text-xs opacity-60">Estado: {a.status}</div>
                <button onClick={()=>remove(a.id)} className="btn mt-2 w-full">Eliminar</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
