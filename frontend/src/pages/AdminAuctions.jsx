import React from 'react'
import { AdminAPI, assetUrl, PLACEHOLDER_IMG } from '../lib/api.js'
import { Auth } from '../lib/auth.js'

export default function AdminAuctions() {
  const [items, setItems] = React.useState([])
  const [errors, setErrors] = React.useState({})
  const [generalError, setGeneralError] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const [form, setForm] = React.useState({
    title: '',
    description: '',
    starting_price: 20,
    image_file: null,
    pdf_file: null,
    product_name: '',
    product_description: '',
    animal: {
      name: '',
      species: '',
    },
  })

  const fieldError = field => errors?.[field]?.[0]

  const load = async () => {
    try {
      const r = await AdminAPI.auctions.list()
      const payload = r.data || r
      const list = Array.isArray(payload)
        ? payload
        : payload.data || []

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
    fd.append('starting_price', form.starting_price)

    fd.append('product_name', form.product_name)
    fd.append('product_description', form.product_description)

    fd.append('animal[name]', form.animal.name)
    fd.append('animal[species]', form.animal.species)

    if (form.image_file) {
      fd.append('image', form.image_file)
    }

    if (form.pdf_file) {
      fd.append('document', form.pdf_file)
    }

    setLoading(true)
    setErrors({})
    setGeneralError('')

    try {
      await AdminAPI.auctions.create(fd)

      setForm({
        title: '',
        description: '',
        starting_price: 20,
        image_file: null,
        pdf_file: null,
        product_name: '',
        product_description: '',
        animal: {
          name: '',
          species: '',
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
    if (
      !confirm(
        '¿Cerrar esta subasta y asignar el ganador automáticamente?'
      )
    ) {
      return
    }

    try {
      const res = await AdminAPI.auctions.close(id)

      alert(
        'Subasta cerrada correctamente. Ganador: ' +
          (res.winner || 'Sin ganador')
      )

      await load()
    } catch (err) {
      alert('Error al cerrar subasta: ' + err.message)
      console.error(err)
    }
  }

  if (!Auth.token() || !Auth.isAdmin()) {
    return (
      <div className="card mx-auto max-w-xl text-center">
        Debes iniciar sesión como administrador.
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl">
        <span className="inline-flex rounded-full bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300 ring-1 ring-emerald-400/20">
          Panel de administración
        </span>

        <h1 className="mt-5 text-4xl font-black tracking-tight">
          Gestión de subastas
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
          Crea nuevas subastas solidarias, adjunta documentos PDF y genera
          automáticamente códigos QR que apuntarán al PDF del producto.
        </p>
      </section>

      <form
        onSubmit={create}
        className="card space-y-7 p-7"
        noValidate
      >
        <div>
          <h2 className="text-2xl font-black text-slate-900">
            Crear nueva subasta
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Completa la información principal del pack solidario.
          </p>
        </div>

        {generalError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {generalError}
          </div>
        )}

        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-xl">
              📝
            </div>

            <div>
              <h3 className="font-black text-slate-900">
                Información de la subasta
              </h3>

              <p className="text-sm text-slate-500">
                Datos visibles para los usuarios.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Título
              </label>

              <input
                value={form.title}
                onChange={e =>
                  setForm({
                    ...form,
                    title: e.target.value,
                  })
                }
                className="input"
                placeholder="Título de la subasta"
                type="text"
              />

              {fieldError('title') && (
                <p className="mt-2 text-sm text-red-600">
                  {fieldError('title')}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Precio inicial
              </label>

              <input
                value={form.starting_price}
                onChange={e =>
                  setForm({
                    ...form,
                    starting_price: e.target.value,
                  })
                }
                className="input"
                placeholder="20"
                type="number"
                min="1"
              />

              {fieldError('starting_price') && (
                <p className="mt-2 text-sm text-red-600">
                  {fieldError('starting_price')}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Descripción
            </label>

            <textarea
              value={form.description}
              onChange={e =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
              className="input min-h-[140px]"
              placeholder="Descripción completa de la subasta"
            />

            {fieldError('description') && (
              <p className="mt-2 text-sm text-red-600">
                {fieldError('description')}
              </p>
            )}
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-xl">
              🎁
            </div>

            <div>
              <h3 className="font-black text-slate-900">
                Información del pack
              </h3>

              <p className="text-sm text-slate-500">
                Datos asociados al producto.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Nombre del pack
              </label>

              <input
                value={form.product_name}
                onChange={e =>
                  setForm({
                    ...form,
                    product_name: e.target.value,
                  })
                }
                className="input"
                placeholder="Pack solidario"
                type="text"
              />

              {fieldError('product_name') && (
                <p className="mt-2 text-sm text-red-600">
                  {fieldError('product_name')}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Descripción del pack
              </label>

              <input
                value={form.product_description}
                onChange={e =>
                  setForm({
                    ...form,
                    product_description: e.target.value,
                  })
                }
                className="input"
                placeholder="Descripción breve"
                type="text"
              />

              {fieldError('product_description') && (
                <p className="mt-2 text-sm text-red-600">
                  {fieldError('product_description')}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pink-100 text-xl">
              🐾
            </div>

            <div>
              <h3 className="font-black text-slate-900">
                Animal relacionado
              </h3>

              <p className="text-sm text-slate-500">
                Información del animal asociado a la subasta.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Nombre
              </label>

              <input
                value={form.animal.name}
                onChange={e =>
                  setForm({
                    ...form,
                    animal: {
                      ...form.animal,
                      name: e.target.value,
                    },
                  })
                }
                className="input"
                placeholder="Nombre del animal"
                type="text"
              />

              {fieldError('animal.name') && (
                <p className="mt-2 text-sm text-red-600">
                  {fieldError('animal.name')}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Especie
              </label>

              <input
                value={form.animal.species}
                onChange={e =>
                  setForm({
                    ...form,
                    animal: {
                      ...form.animal,
                      species: e.target.value,
                    },
                  })
                }
                className="input"
                placeholder="Perro, gato..."
                type="text"
              />

              {fieldError('animal.species') && (
                <p className="mt-2 text-sm text-red-600">
                  {fieldError('animal.species')}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-100 text-xl">
              📂
            </div>

            <div>
              <h3 className="font-black text-slate-900">
                Archivos
              </h3>

              <p className="text-sm text-slate-500">
                Imagen principal y PDF del producto.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl border border-dashed border-slate-300 p-5">
              <label className="mb-3 block text-sm font-semibold text-slate-700">
                Imagen principal
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0] || null

                  setForm(f => ({
                    ...f,
                    image_file: file,
                  }))
                }}
                className="input"
              />

              <p className="mt-3 text-xs text-slate-500">
                JPG, PNG o WEBP.
              </p>

              {fieldError('image') && (
                <p className="mt-2 text-sm text-red-600">
                  {fieldError('image')}
                </p>
              )}
            </div>

            <div className="rounded-3xl border border-dashed border-slate-300 p-5">
              <label className="mb-3 block text-sm font-semibold text-slate-700">
                Documento PDF
              </label>

              <input
                type="file"
                accept="application/pdf"
                onChange={e => {
                  const file = e.target.files?.[0] || null

                  setForm(f => ({
                    ...f,
                    pdf_file: file,
                  }))
                }}
                className="input"
              />

              <p className="mt-3 text-xs text-slate-500">
                El QR apuntará automáticamente a este documento.
              </p>

              {fieldError('document') && (
                <p className="mt-2 text-sm text-red-600">
                  {fieldError('document')}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            ✅ El código QR se genera automáticamente usando el PDF subido.
          </div>
        </section>

        <button
          className="btn w-full py-4 text-base"
          disabled={loading}
        >
          {loading ? 'Creando subasta...' : 'Crear subasta'}
        </button>
      </form>

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              Subastas existentes
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Gestiona el estado de las subastas activas.
            </p>
          </div>

          <span className="badge badge-green">
            {items.length} subastas
          </span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map(a => {
            const raw =
              a?.product?.animal?.photo_url ||
              a?.image_url ||
              a?.photo_url

            const img = assetUrl(raw) || PLACEHOLDER_IMG

            return (
              <div
                key={a.id}
                className="card overflow-hidden p-0"
              >
                <div className="relative">
                  <img
                    src={img}
                    className="h-52 w-full object-cover"
                    alt={a.title || ''}
                    onError={ev => {
                      ev.currentTarget.src = PLACEHOLDER_IMG
                    }}
                  />

                  <div className="absolute left-3 top-3">
                    <span
                      className={`badge ${
                        a.status === 'active'
                          ? 'badge-green'
                          : 'badge-red'
                      }`}
                    >
                      {a.status}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-black text-slate-900">
                    {a.title}
                  </h3>

                  <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="text-xs text-slate-500">
                      Precio actual
                    </p>

                    <p className="text-2xl font-black text-slate-900">
                      {a.current_price && a.current_price > 0
                        ? a.current_price
                        : a.starting_price || 20}{' '}
                      €
                    </p>
                  </div>

                  <div className="mt-5 space-y-3">
                    <button
                      onClick={() => closeAuction(a.id)}
                      className="w-full rounded-2xl bg-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={a.status !== 'active'}
                    >
                      Cerrar subasta
                    </button>

                    <button
                      onClick={() => remove(a.id)}
                      className="btn-secondary w-full"
                    >
                      Eliminar
                    </button>

                    {a.qr_url ? (
                      <a
                        href={assetUrl(a.qr_url)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn w-full text-center"
                      >
                        Ver QR
                      </a>
                    ) : (
                      <div className="rounded-2xl bg-slate-100 px-4 py-3 text-center text-xs text-slate-500">
                        QR pendiente de generar
                      </div>
                    )}

                    {a.document_url ? (
                      <a
                        href={assetUrl(a.document_url)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary w-full text-center"
                      >
                        Ver PDF
                      </a>
                    ) : (
                      <div className="rounded-2xl bg-slate-100 px-4 py-3 text-center text-xs text-slate-500">
                        Sin documento PDF
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}