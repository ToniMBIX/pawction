import React from 'react'
import { AdminAPI, assetUrl } from '../lib/api.js'
import { Auth } from '../lib/auth.js'

export default function AdminAuctions() {
  const [items, setItems] = React.useState([])
  const [errors, setErrors] = React.useState({})
  const [generalError, setGeneralError] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const [form, setForm] = React.useState({
    title: '',
    description: '',
    image_url: '',
    image_file: null,
    pdf_file: null,
    qr_file: null,
    product_id: '',
    animal: {
      name: '',
      species: 'Perro',
      age: '',
      photo_url: '',
      info_url: '',
    },
  })

  const fieldError = field => errors?.[field]?.[0]

  const load = async () => {
    try {
      const r = await AdminAPI.auctions.list()
      const list = Array.isArray(r) ? r : r.data || []
      setItems(list)
    } catch (e) {
      console.error('Error cargando subastas admin', e)
    }
  }

  React.useEffect(() => {
    load()
  }, [])

  const create = async e => {
    e.preventDefault()

    const fd = new FormData()

    fd.append('title', form.title)
    fd.append('description', form.description)

    if (form.image_file) {
      fd.append('image', form.image_file)
    }

    if (form.image_url) {
      fd.append('image_url', form.image_url)
    }

    if (form.product_id) {
      fd.append('product_id', form.product_id)
    }

    if (form.animal.name) {
      fd.append('animal[name]', form.animal.name)
      fd.append('animal[species]', form.animal.species)
      fd.append('animal[age]', form.animal.age)
      fd.append('animal[photo_url]', form.animal.photo_url)
      fd.append('animal[info_url]', form.animal.info_url)
    }

    if (form.pdf_file) {
      fd.append('document', form.pdf_file)
    }

    if (form.qr_file) {
      fd.append('qr', form.qr_file)
    }

    setLoading(true)
    setErrors({})
    setGeneralError('')

    try {
      await AdminAPI.auctions.create(fd)

      setForm({
        title: '',
        description: '',
        image_url: '',
        image_file: null,
        pdf_file: null,
        qr_file: null,
        product_id: '',
        animal: {
          name: '',
          species: 'Perro',
          age: '',
          photo_url: '',
          info_url: '',
        },
      })

      await load()
    } catch (err) {
      setErrors(err.errors || {})
      setGeneralError(err.message || 'Error creando la subasta')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const uploadQR = async (id, file) => {
    if (!file) return

    const fd = new FormData()
    fd.append('qr', file)

    try {
      await AdminAPI.auctions.uploadQr(id, fd)
      await load()
    } catch (err) {
      alert(err.message || 'Error al subir QR')
      console.error(err)
    }
  }

  const remove = async id => {
    if (!confirm('¿Eliminar subasta?')) return

    try {
      await AdminAPI.auctions.remove(id)
      setItems(items.filter(x => x.id !== id))
    } catch (e) {
      alert(e.message || 'No se pudo eliminar')
      console.error(e)
    }
  }

  const closeAuction = async id => {
    if (!confirm('¿Cerrar esta subasta y asignar el ganador automáticamente?')) {
      return
    }

    try {
      const res = await AdminAPI.auctions.close(id)
      alert('Subasta cerrada correctamente. Ganador: ' + (res.winner || 'Sin ganador'))
      await load()
    } catch (err) {
      alert('Error al cerrar subasta: ' + err.message)
      console.error(err)
    }
  }

  if (!Auth.token() || !Auth.isAdmin()) {
    return <div className="text-center">Debes iniciar sesión como admin.</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gestión de subastas</h1>

      <form onSubmit={create} className="card grid gap-3" noValidate>
        <h2 className="font-semibold">Crear subasta</h2>

        {generalError && (
          <div className="rounded-xl border border-red-500 bg-red-50 px-3 py-2 text-sm text-red-700">
            {generalError}
          </div>
        )}

        <div>
          <input
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            className="input"
            placeholder="Título"
            type="text"
          />

          {fieldError('title') && (
            <p className="mt-1 text-sm text-red-600">
              {fieldError('title')}
            </p>
          )}
        </div>

        <div>
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="input"
            placeholder="Descripción"
          />

          {fieldError('description') && (
            <p className="mt-1 text-sm text-red-600">
              {fieldError('description')}
            </p>
          )}
        </div>

        <div>
          <input
            value={form.image_url}
            onChange={e => setForm({ ...form, image_url: e.target.value })}
            className="input"
            placeholder="Imagen URL"
            type="text"
          />

          {fieldError('image_url') && (
            <p className="mt-1 text-sm text-red-600">
              {fieldError('image_url')}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Imagen
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={e => {
              const file = e.target.files?.[0] || null
              setForm(f => ({ ...f, image_file: file }))
            }}
            className="input"
          />

          {fieldError('image') && (
            <p className="mt-1 text-sm text-red-600">
              {fieldError('image')}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <input
              value={form.product_id}
              onChange={e => setForm({ ...form, product_id: e.target.value })}
              className="input"
              placeholder="product_id"
              type="text"
            />

            {fieldError('product_id') && (
              <p className="mt-1 text-sm text-red-600">
                {fieldError('product_id')}
              </p>
            )}
          </div>

          <div className="text-sm opacity-70 self-center">
            O rellena datos del animal para crear el pack automáticamente
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <input
              value={form.animal.name}
              onChange={e =>
                setForm({
                  ...form,
                  animal: { ...form.animal, name: e.target.value },
                })
              }
              className="input"
              placeholder="Animal nombre"
              type="text"
            />

            {fieldError('animal.name') && (
              <p className="mt-1 text-sm text-red-600">
                {fieldError('animal.name')}
              </p>
            )}
          </div>

          <div>
            <input
              value={form.animal.photo_url}
              onChange={e =>
                setForm({
                  ...form,
                  animal: { ...form.animal, photo_url: e.target.value },
                })
              }
              className="input"
              placeholder="Animal photo_url"
              type="text"
            />

            {fieldError('animal.photo_url') && (
              <p className="mt-1 text-sm text-red-600">
                {fieldError('animal.photo_url')}
              </p>
            )}
          </div>

          <div>
            <input
              value={form.animal.species}
              onChange={e =>
                setForm({
                  ...form,
                  animal: { ...form.animal, species: e.target.value },
                })
              }
              className="input"
              placeholder="Especie"
              type="text"
            />

            {fieldError('animal.species') && (
              <p className="mt-1 text-sm text-red-600">
                {fieldError('animal.species')}
              </p>
            )}
          </div>

          <div>
            <input
              value={form.animal.age}
              onChange={e =>
                setForm({
                  ...form,
                  animal: { ...form.animal, age: e.target.value },
                })
              }
              className="input"
              placeholder="Edad"
              type="text"
            />

            {fieldError('animal.age') && (
              <p className="mt-1 text-sm text-red-600">
                {fieldError('animal.age')}
              </p>
            )}
          </div>

          <div>
            <input
              value={form.animal.info_url}
              onChange={e =>
                setForm({
                  ...form,
                  animal: { ...form.animal, info_url: e.target.value },
                })
              }
              className="input"
              placeholder="Info URL"
              type="text"
            />

            {fieldError('animal.info_url') && (
              <p className="mt-1 text-sm text-red-600">
                {fieldError('animal.info_url')}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              PDF
            </label>

            <input
              type="file"
              accept="application/pdf"
              onChange={e => {
                const file = e.target.files?.[0] || null
                setForm(f => ({ ...f, pdf_file: file }))
              }}
              className="input"
            />

            {fieldError('document') && (
              <p className="mt-1 text-sm text-red-600">
                {fieldError('document')}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              QR
            </label>

            <input
              type="file"
              accept="application/pdf"
              onChange={e => {
                const file = e.target.files?.[0] || null
                setForm(f => ({ ...f, qr_file: file }))
              }}
              className="input"
            />

            {fieldError('qr') && (
              <p className="mt-1 text-sm text-red-600">
                {fieldError('qr')}
              </p>
            )}
          </div>
        </div>

        <button className="btn w-full" disabled={loading}>
          {loading ? 'Creando...' : 'Crear subasta'}
        </button>
      </form>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map(a => {
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
                alt={a.title || ''}
                onError={ev => {
                  ev.currentTarget.src = '/placeholder.jpg'
                }}
              />

              <div className="mt-2">
                <div className="font-semibold">{a.title}</div>

                <div className="text-sm opacity-80">
                  Actual: {a.current_price && a.current_price > 0 ? a.current_price : 20} €
                </div>

                <div className="text-xs opacity-60">
                  Estado: {a.status}
                </div>

                <button
                  onClick={() => closeAuction(a.id)}
                  className="btn mt-2 w-full bg-orange-600 text-white"
                  disabled={a.status !== 'active'}
                >
                  Cerrar subasta
                </button>

                <button
                  onClick={() => remove(a.id)}
                  className="btn mt-2 w-full"
                >
                  Eliminar
                </button>

                {a.qr_url ? (
                  <a
                    href={assetUrl(a.qr_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn bg-green-600 text-white mt-2 w-full block text-center"
                  >
                    Ver QR
                  </a>
                ) : (
                  <label className="btn bg-purple-600 text-white mt-2 w-full cursor-pointer block text-center">
                    Agregar QR
                    <input
                      type="file"
                      accept="application/pdf"
                      hidden
                      onChange={e => uploadQR(a.id, e.target.files?.[0])}
                    />
                  </label>
                )}

                {a.document_url ? (
                  <a
                    href={assetUrl(a.document_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn bg-blue-600 text-white mt-2 w-full block text-center"
                  >
                    Ver PDF
                  </a>
                ) : (
                  <div className="text-xs opacity-60 mt-2 text-center">
                    Sin documento adjunto
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}