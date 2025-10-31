import React from 'react'
import { AuthAPI, AuctionsAPI } from '../lib/api.js'

export default function Favorites(){
  const [me, setMe] = React.useState(null)
  const [items, setItems] = React.useState([])

  React.useEffect(() => {
    (async () => {
      const u = await AuthAPI.me()
      setMe(u)
      const page1 = await AuctionsAPI.list(1)
      const favs = new Set(u.favorites || [])
      setItems((page1.data || []).filter(a => favs.has(a.id)))
    })()
  }, [])

  if (!me) return <div className="p-6">Cargando…</div>

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Mis favoritos</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(a => (
          <a key={a.id} href={`/auctions/${a.id}`} className="block border rounded-xl overflow-hidden hover:shadow">
            <img src={a.image_url || a.product?.animal?.image_url} alt={a.title} />
            <div className="p-4">
              <div className="font-semibold">{a.title}</div>
              <div className="text-sm text-gray-600">{(a.current_price || 0).toFixed(2)} €</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
