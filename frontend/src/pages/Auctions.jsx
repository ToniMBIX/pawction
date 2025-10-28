import React from 'react'
import { Link } from 'react-router-dom'
import { AuctionsAPI } from '../lib/api.js'

export default function Auctions(){
  const [items, setItems] = React.useState([])
  React.useEffect(()=>{ AuctionsAPI.list().then(r=>setItems(r.data||[])).catch(()=>{}) },[])
  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
      {items.map(a => (
        <Link to={`/auctions/${a.id}`} key={a.id} className="card">
          <img src={a.product?.animal?.photo_url} alt="" className="w-full h-40 object-cover rounded-xl" />
          <div className="mt-3">
            <h3 className="font-bold">{a.title}</h3>
            <div className="mt-2 text-sm">Actual: <b>{a.current_price} €</b></div>
          </div>
        </Link>
      ))}
    </div>
  )
}
