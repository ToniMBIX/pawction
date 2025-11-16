// frontend/src/pages/BidsHistory.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { BidsAPI, assetUrl } from '../lib/api.js'
import { Auth } from '../lib/auth.js'

export default function BidsHistory() {
  const [items, setItems] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (!Auth.isLogged()) {
      setLoading(false)
      setItems([])
      return
    }

    BidsAPI.mine()
      .then(r => {
        const list = Array.isArray(r) ? r : r.data || []
        setItems(list)
      })
      .catch(err => {
        console.error('Error cargando historial de pujas', err)
        setItems([])
      })
      .finally(() => setLoading(false))
  }, [])

  if (!Auth.isLogged()) {
    return (
      <div className="text-center text-sm opacity-80">
        Debes iniciar sesión para ver tu historial de pujas.
      </div>
    )
  }

  if (loading) return <div>Cargando historial…</div>

  if (!items.length) {
    return (
      <div className="text-center text-sm opacity-70">
        Aún no has realizado ninguna puja.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map(b => {
        const a = b.auction || {}
        const raw =
          a?.product?.animal?.photo_url ||
          a?.image_url ||
          a?.photo_url

        const img = assetUrl(raw) || '/placeholder.jpg'

        return (
          <Link
            to={`/auctions/${a.id}`}
            key={b.id}
            className="card flex gap-4 hover:shadow-lg transition-all"
          >
            <img
              src={img}
              alt=""
              className="w-32 h-24 object-cover rounded-xl"
              onError={ev => {
                ev.currentTarget.src = '/placeholder.jpg'
              }}
            />
            <div className="flex-1">
              <div className="font-semibold">{a.title}</div>
              <div className="text-sm opacity-80">
                Tu puja: <b>{Number(b.amount)} €</b>
              </div>
              <div className="text-xs opacity-60">
                Fecha: {new Date(b.created_at).toLocaleString()}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
