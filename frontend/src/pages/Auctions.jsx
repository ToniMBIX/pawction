// frontend/src/pages/Home.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { AuctionsAPI, assetUrl } from '../lib/api.js'

export default function Home() {
  const [items, setItems] = React.useState([])

  React.useEffect(() => {
    AuctionsAPI.list()
      .then(r => {
        const list = Array.isArray(r) ? r : (r.data || [])
        setItems(list)
      })
      .catch(() => setItems([]))
  }, [])

  // Función auxiliar para mostrar el estado de cada subasta
  function getStatusText(a) {
    // Aún no ha empezado → sin primera puja
    if ((!a.end_at || a.current_price === null) && a.status !== 'active') {
      return "Esperando primera puja"
    }

    // Subasta activa con contador
    if (a.ends_in_seconds != null && a.ends_in_seconds > 0) {
      const s = a.ends_in_seconds
      const h = Math.floor(s / 3600)
      const m = Math.floor((s % 3600) / 60)
      const sec = s % 60
      return `Termina en: ${h}h ${m}m ${sec}s`
    }

    // Finalizada
    return "Finalizada"
  }

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {items.map(a => {
        const raw =
          a?.product?.animal?.photo_url ||
          a?.image_url ||
          a?.photo_url

        const img = assetUrl(raw) || '/placeholder.jpg'

        return (
          <Link to={`/auctions/${a.id}`} key={a.id} className="card">
            <img
              src={img}
              alt=""
              className="w-full h-40 object-cover rounded-xl"
              onError={(ev) => { ev.currentTarget.src = '/placeholder.jpg' }}
            />

            <div className="mt-3">
              <h3 className="font-bold">{a.title}</h3>
              <p className="text-sm opacity-70 line-clamp-2">{a.description}</p>

              <div className="mt-2 text-sm">
                Precio actual: <b>{a.current_price || 20} €</b>
              </div>

              {/* NUEVA LÓGICA AQUÍ */}
              <div className="text-xs opacity-60 mt-1">
                {getStatusText(a)}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
