import React from 'react'
import { Link } from 'react-router-dom'
import { AuctionsAPI, assetUrl } from '../lib/api.js'

export default function Home(){
  const [items, setItems] = React.useState([])

  React.useEffect(()=>{
    AuctionsAPI.list()
      .then(r => {
        const list = Array.isArray(r) ? r : (r.data || [])
        setItems(list)
      })
      .catch(()=> setItems([]))
  },[])

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
              onError={(ev)=>{ ev.currentTarget.src = '/placeholder.jpg' }}
            />
            <div className="mt-3">
              <h3 className="font-bold">{a.title}</h3>
              <p className="text-sm opacity-70 line-clamp-2">{a.description}</p>
              <div className="mt-2 text-sm">Precio actual: <b>{a.current_price || 20} €</b></div>
              <div className="text-xs opacity-60">Termina: {new Date(a.end_at).toLocaleString() || ""}</div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
