// frontend/src/pages/AuctionDetail.jsx
import React from 'react'
import { useParams } from 'react-router-dom'
import { AuctionsAPI, FavoritesAPI, AuthAPI } from '../lib/api.js'
import { Auth } from '../lib/auth.js'

export default function AuctionDetail(){
  const { id } = useParams()
  const [a, setA] = React.useState(null)
  const [amount, setAmount] = React.useState('')
  const [fav, setFav] = React.useState(false)
  const [left, setLeft] = React.useState('—')
  const [loading, setLoading] = React.useState(true)

  // --- helpers ---
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

  async function resolveFavorite(auctionId){
    // 1) si el backend ya manda is_favorite úsalo
    // 2) si no, lo deducimos consultando /me
    if (!Auth.isLogged()) return false
    try {
      const me = await AuthAPI.me()
      const favs = me?.favorites || []
      return favs.some(f => Number(f.id) === Number(auctionId))
    } catch {
      return false
    }
  }

  // --- load auction ---
  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await AuctionsAPI.get(id)
      setA(data)

      // estado favorito
      if (typeof data.is_favorite !== 'undefined') {
        setFav(!!data.is_favorite)
      } else {
        const isFav = await resolveFavorite(id)
        setFav(isFav)
      }

      updateLeft(data.end_at)
    } finally {
      setLoading(false)
    }
  }, [id])

  React.useEffect(()=>{ load() },[load])

  // Temporizador
  React.useEffect(()=>{
    if (!a?.end_at) return
    const t = setInterval(()=> updateLeft(a.end_at), 1000)
    return ()=> clearInterval(t)
  },[a?.end_at])

  // --- actions ---
  async function submitBid(e){
    e.preventDefault()
    if(!Auth.isLogged()) return alert('Inicia sesión para pujar')

    const val = parseFloat(amount)
    if (Number.isNaN(val)) return alert('Introduce una cantidad válida')

    // Reglas:
    // - primera puja: >= 20 €
    // - siguientes: > precio actual
    const current = Number(a?.current_price || 0)
    if (current === 0 && val < 20) {
      return alert('La primera puja debe ser de al menos 20 €')
    }
    if (current > 0 && val <= current) {
      return alert(`La puja debe ser mayor que ${current} €`)
    }

    try {
      await AuctionsAPI.bid(a.id, val)
      setAmount('')
      await load()
    } catch(err){
      alert(err.message || 'No se pudo registrar la puja')
    }
  }

  async function toggleFav(){
    if(!Auth.isLogged()) return alert('Inicia sesión para usar favoritos')
    try{
      const r = await FavoritesAPI.toggle(a.id)
      // El backend devuelve { favorited: boolean, ... }
      setFav(!!r.favorited)
    }catch(e){
      alert(e.message || 'No se pudo actualizar el favorito')
    }
  }

  // --- render ---
  if(loading || !a) return <div>Cargando…</div>

  const img = a?.product?.animal?.photo_url || a?.image_url || '/placeholder.jpg'

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <img
          src={img}
          alt=""
          className="w-full rounded-xl object-cover max-h-[420px]"
          onError={(ev)=>{ ev.currentTarget.src = '/placeholder.jpg' }}
        />
      </div>

      <div className="space-y-3">
        <h1 className="text-2xl font-bold">{a.title}</h1>
        {a.description && <p className="opacity-80">{a.description}</p>}

        <div>Precio actual: <b>{Number(a.current_price || 0)} €</b></div>
        <div>Termina en: <b>{left}</b></div>

        <form onSubmit={submitBid} className="flex gap-2">
          <input
            className="input"
            type="number"
            step="0.01"
            min={a.current_price > 0 ? (Number(a.current_price) + 0.01) : 20}
            value={amount}
            onChange={e=>setAmount(e.target.value)}
            placeholder={a.current_price > 0 ? `> ${a.current_price}` : '≥ 20'}
          />
          <button className="btn">Pujar</button>
        </form>

        <button onClick={toggleFav} className="btn">
          {fav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        </button>
      </div>
    </div>
  )
}
