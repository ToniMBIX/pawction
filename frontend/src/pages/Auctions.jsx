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
        const img =
          a?.image_url ||
          a?.product?.animal?.photo_url ||
          a?.photo_url ||
          '/placeholder.jpg'
        return (
          <Link to={`/auctions/${a.id}`} key={a.id} className="card">
            <img src={img} alt="" className="w-full h-40 object-cover rounded-xl" />
            <div className="mt-3">
              <h3 className="font-bold">{a.title}</h3>
              <div className="mt-2 text-sm">Actual: <b>{a.current_price} €</b></div>
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
