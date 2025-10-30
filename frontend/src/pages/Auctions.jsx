import React from 'react'
import { Link } from 'react-router-dom'
import { AuctionsAPI } from '../lib/api.js'

export default function Auctions(){
  const [items, setItems] = React.useState([])

  React.useEffect(()=>{
    AuctionsAPI.list()
      .then(r => {
        const list = Array.isArray(r) ? r : (r.data || [])
        setItems(list)
      })
      .catch(() => setItems([]))
  },[])

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
      {items.map(a => {
        // usamos SIEMPRE la foto del animal si existe, que sabemos que viene
        const img =
          a?.product?.animal?.photo_url ||
          a?.image_url ||
          'https://picsum.photos/seed/paw-placeholder/600/400'  // evita /placeholder.jpg local

        const precio = Number(a?.current_price || 0)
        const etiquetaPrecio = precio > 0 ? `${precio} €` : 'Precio inicial: 20 €'

        return (
          <Link to={`/auctions/${a.id}`} key={a.id} className="card">
            <img src={img} alt="" className="w-full h-40 object-cover rounded-xl" />
            <div className="mt-3">
              <h3 className="font-bold">{a.title}</h3>
              <p className="text-sm opacity-70 line-clamp-2">{a.description}</p>
              <div className="mt-2 text-sm">Actual: <b>{etiquetaPrecio}</b></div>
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
