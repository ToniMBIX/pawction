import React from 'react'
import { Link } from 'react-router-dom'
import { AuctionsAPI } from '../lib/api.js'

export default function Home() {
  const [items, setItems] = React.useState([])

  React.useEffect(() => {
    AuctionsAPI.list()
      .then(r => {
        // Soporta /api/auctions con paginate o array
        const list = Array.isArray(r) ? r : (r.data || [])
        setItems(list)
      })
      .catch(() => setItems([]))
  }, [])

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {items.map(a => {
        const img =
  a?.image_url?.startsWith('http')
    ? a.image_url
    : a?.product?.animal?.photo_url?.startsWith('http')
      ? a.product.animal.photo_url
      : 'https://picsum.photos/seed/paw-placeholder/600/400'

        const endAt = a?.end_at ? new Date(a.end_at) : null
        const endAtText = endAt ? endAt.toLocaleString() : '—'

        return (
          <Link to={`/auctions/${a.id}`} key={a.id} className="card">
            <img src={img} alt="" className="w-full h-40 object-cover rounded-xl" />
            <div className="mt-3">
              <h3 className="font-bold">{a.title}</h3>
              <p className="text-sm opacity-70 line-clamp-2">{a.description}</p>
              <div className="mt-2 text-sm">Precio actual: <b>{a.current_price} €</b></div>
              <div className="text-xs opacity-60">Termina: {endAtText}</div>
            </div>
          </Link>
        )
      })}

      {items.length === 0 && (
        <div className="col-span-full text-center text-sm opacity-70">
          No hay subastas disponibles todavía.
        </div>
      )}
    </div>
  )
}
