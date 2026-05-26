import React from 'react'
import { Link } from 'react-router-dom'
import { FavoritesAPI, assetUrl } from '../lib/api.js'
import { Auth } from '../lib/auth.js'

export default function Favorites() {
  const [items, setItems] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    async function load() {
      if (!Auth.isLogged()) {
        setLoading(false)
        setItems([])
        return
      }

      setLoading(true)
      setError('')

      try {
        const r = await FavoritesAPI.list()
        const list = Array.isArray(r) ? r : r.data || []
        setItems(list)
      } catch (err) {
        console.error(err)
        setError(err.message || 'No se pudieron cargar los favoritos')
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (!Auth.isLogged()) {
    return (
      <div className="card max-w-xl mx-auto text-center">
        Debes iniciar sesión para ver tus favoritos.
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-10 opacity-70">
        Cargando favoritos...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Mis favoritos</h1>

      {error && (
        <div className="rounded-xl border border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!error && items.length === 0 && (
        <div className="card text-center opacity-70">
          Aún no tienes subastas en favoritos.
        </div>
      )}

      {items.length > 0 && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                  alt={a.title || 'Subasta favorita'}
                  className="w-full h-40 object-cover rounded-xl"
                  onError={ev => {
                    ev.currentTarget.src = '/placeholder.jpg'
                  }}
                />

                <div className="mt-3">
                  <h3 className="font-bold">
                    {a.title || 'Subasta sin título'}
                  </h3>

                  <div className="mt-2 text-sm">
                    Precio actual:{' '}
                    <b>{Number(a.current_price || a.starting_price || 0)} €</b>
                  </div>

                  <div className="text-xs opacity-60">
                    Estado: {a.status || 'desconocido'}
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