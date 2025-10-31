import React from 'react'
import { useParams } from 'react-router-dom'
import { AuctionsAPI, FavoritesAPI } from '../lib/api.js'
import { Auth } from '../lib/auth.js'

export default function AuctionDetail(){
  const { id } = useParams()
  const [a, setA] = React.useState(null)
  const [amount, setAmount] = React.useState('')
  const [fav, setFav] = React.useState(false)
  const [left, setLeft] = React.useState('')

  const load = async () => {
    const data = await AuctionsAPI.get(id)
    setA(data)
    setFav(!!data.is_favorite)
    updateLeft(data.end_at)
  }

  React.useEffect(()=>{ load() },[id])

  React.useEffect(()=>{
    const t = setInterval(()=> updateLeft(a?.end_at), 1000)
    return ()=> clearInterval(t)
  },[a?.end_at])

  function updateLeft(end_at){
    if(!end_at){ setLeft('—'); return }
    const end = new Date(end_at).getTime()
    const now = Date.now()
    const diff = Math.max(0, end - now)
    const hh = Math.floor(diff/3600000)
    const mm = Math.floor((diff%3600000)/60000)
    const ss = Math.floor((diff%60000)/1000)
    setLeft(`${hh}h ${mm}m ${ss}s`)
  }

  async function submitBid(e){
    e.preventDefault()
    if(!Auth.isLogged()) return alert('Inicia sesión para pujar')
    const val = parseFloat(amount)
    if(isNaN(val)) return
    try {
      const r = await AuctionsAPI.bid(a.id, val)
      await load()
      setAmount('')
    } catch(err){
      alert(err.message)
    }
  }

  async function toggleFav(){
    if(!Auth.isLogged()) return alert('Inicia sesión para usar favoritos')
    try{
      const r = await FavoritesAPI.toggle(a.id)
      setFav(!!r.favorite)
    }catch(e){ alert(e.message) }
  }

  if(!a) return <div>Cargando…</div>

  const img = a?.product?.animal?.photo_url || a?.image_url || '/placeholder.jpg'

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <img src={img} alt="" className="w-full rounded-xl object-cover max-h-[420px]" />
      </div>
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">{a.title}</h1>
        <p className="opacity-80">{a.description}</p>
        <div>Precio actual: <b>{a.current_price} €</b></div>
        <div>Termina en: <b>{left}</b></div>

        <form onSubmit={submitBid} className="flex gap-2">
          <input className="input" type="number" step="0.01"
                 value={amount} onChange={e=>setAmount(e.target.value)}
                 placeholder={a.current_price > 0 ? `> ${a.current_price}` : '≥ 20'} />
          <button className="btn">Pujar</button>
        </form>

        <button onClick={toggleFav} className="btn">
          {fav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        </button>
      </div>
    </div>
  )
}
