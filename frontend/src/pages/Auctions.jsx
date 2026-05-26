import React from 'react'
import { Link } from 'react-router-dom'
import { AuctionsAPI, assetUrl } from '../lib/api.js'

export default function Auctions() {
  const [items, setItems] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')

      try {
        const r = await AuctionsAPI.list()
        const list = Array.isArray(r) ? r : r.data || []
        setItems(list)
      } catch (err) {
        console.error(err)
        setError(err.message || 'No se pudieron cargar las subastas')
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  React.useEffect(() => {
    const t = setInterval(() => {
      setItems(prev =>
        prev.map(a => {
          if (a.status !== 'active') return a
          if (a.ends_in_seconds == null) return a

          const next = Number(a.ends_in_seconds) - 1

          return {
            ...a,
            ends_in_seconds: next > 0 ? next : 0,
          }
        })
      )
    }, 1000)

    return () => clearInterval(t)
  }, [])

  function getStatusText(a) {
    const ends =
      a.ends_in_seconds === null || a.ends_in_seconds === undefined
        ? null
        : Number(a.ends_in_seconds)

    if (a.status === 'finished') {
      return 'Subasta finalizada'
    }

    if (a.status === 'active' && !a.end_at) {
      return 'Esperando primera puja'
    }

    if (a.status === 'active' && ends !== null && ends > 0) {
      const h = Math.floor(ends / 3600)
      const m = Math.floor((ends % 3600) / 60)
      const s = ends % 60

      return `Termina en: ${h}h ${m}m ${s}s`
    }

    if (a.status === 'active' && ends !== null && ends <= 0) {
      return 'Finalizando...'
    }

    return 'Estado no disponible'
  }

  if (loading) {
    return (
      <div className="text-center py-10 opacity-70">
        Cargando subastas...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Subastas</h1>

      {error && (
        <div className="rounded-xl border border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!error && items.length === 0 && (
        <div className="card text-center opacity-70">
          No hay subastas disponibles ahora mismo.
        </div>
      )}

      {items.length > 0 && (
        <div className="grid md:grid-cols-3 gap-4">
          {items.map(a => {
            const raw =
              a?.product?.animal?.photo_url ||
              a?.image_url ||
              a?.photo_url

            const img = assetUrl(raw) || '/placeholder.jpg'

            return (
              <Link
                to={`/auctions/${a.id}`}
                key={a.id}
                className="card hover:shadow-xl transition-all"
              >
                <img
                  src={img}
                  alt={a.title || 'Subasta'}
                  className="w-full h-40 object-cover rounded-xl"
                  onError={ev => {
                    ev.currentTarget.src = '/placeholder.jpg'
                  }}
                />

                <div className="mt-3">
                  <h3 className="font-bold">
                    {a.title || 'Subasta sin título'}
                  </h3>

                  {a.description && (
                    <p className="text-sm opacity-70 line-clamp-2">
                      {a.description}
                    </p>
                  )}

                  <div className="mt-2 text-sm">
                    Precio actual:{' '}
                    <b>
                      {Number(a.current_price || a.starting_price || 20)} €
                    </b>
                  </div>

                  <div className="text-xs opacity-60 mt-1">
                    {getStatusText(a)}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}