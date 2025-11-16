// frontend/src/pages/Favorites.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { FavoritesAPI, assetUrl } from '../lib/api.js'
import { Auth } from '../lib/auth.js'

export default function Favorites() {
  const [items, setItems] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (!Auth.isLogged()) {
      setLoading(false)
      setItems([])
      return
    }

    FavoritesAPI.list()
      .then(r => {
        const list = Array.isArray(r) ? r : r.data || []
        setItems(list)
      })
      .catch(err => {
        console.error('Error cargando favoritos', err)
        setItems([])
      })
      .finally(() => setLoading(false))
  }, [])

  if (!Auth.isLogged()) {
    return (
      <div className="text-center text-sm opacity-80">
        Debes iniciar sesión para ver tus favoritos.
      </div>
    )
  }

  if (loading) {
    return <div>Cargando favoritos…</div>
  }

  if (!items.length) {
    return (
      <div className="text-center text-sm opacity-70">
        Aún no tienes subastas en favoritos.
      </div>
    )
  }

  return (
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
              alt=""
              className="w-full h-40 object-cover rounded-xl"
              onError={ev => {
                ev.currentTarget.src = '/placeholder.jpg'
              }}
            />
            <div className="mt-3">
              <h3 className="font-bold">{a.title}</h3>
              <div className="mt-2 text-sm">
                Precio actual: <b>{Number(a.current_price || 0)} €</b>
              </div>
              <div className="text-xs opacity-60">Estado: {a.status}</div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
