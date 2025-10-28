import React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { AuctionsAPI, FavoritesAPI } from '../lib/api.js'
import Countdown from '../components/Countdown.jsx'
import BidBox from '../components/BidBox.jsx'

export default function AuctionDetail(){
  const { id } = useParams()
  const [a, setA] = React.useState(null)
  const nav = useNavigate()

  React.useEffect(()=>{ AuctionsAPI.get(id).then(setA).catch(()=>{}) },[id])

  if(!a) return <div>Cargando...</div>

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 card">
        <img src={a.product?.animal?.photo_url} alt="" className="w-full h-80 object-cover rounded-xl" />
        <h1 className="text-2xl font-bold mt-3">{a.title}</h1>
        <p className="opacity-80 mt-2">{a.description}</p>
        <div className="mt-3 text-sm flex gap-4">
          <div>Precio actual: <b>{a.current_price} €</b></div>
          <div>Termina en: <Countdown endAt={a.end_at} /></div>
        </div>
        <div className="mt-4">
          <a className="underline text-sm" href={`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/auctions/${a.id}/qr`} target="_blank">Ver QR</a>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {a.status==='active' ? <BidBox auction={a} onBid={setA}/> : (
          <div className="card">Subasta finalizada.</div>
        )}
        <button className="btn" onClick={()=>FavoritesAPI.toggle(a.id).then(()=>alert('Actualizado favoritos'))}>
          Añadir / quitar favorito
        </button>
        {a.status==='finished' && <button className="btn" onClick={()=>nav(`/checkout/${a.id}`)}>Ir a pagar</button>}
      </div>
    </div>
  )
}
