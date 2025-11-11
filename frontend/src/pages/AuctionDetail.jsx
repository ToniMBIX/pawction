// frontend/src/pages/AuctionDetail.jsx
import React from 'react'
import { useParams } from 'react-router-dom'
import { AuctionsAPI, FavoritesAPI, AuthAPI } from '../lib/api.js'
import { Auth } from '../lib/auth.js'

export default function AuctionDetail(){
  const { id } = useParams()
  const [a, setA] = React.useState(null)
  const [timeLeft, setTimeLeft] = React.useState('—')
  const [amount, setAmount] = React.useState('')
  const [fav, setFav] = React.useState(false)
  const [loading, setLoading] = React.useState(true)

  // --- helpers ---
  async function resolveFavorite(auctionId){
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

      if (typeof data.is_favorite !== 'undefined') {
        setFav(!!data.is_favorite)
      } else {
        const isFav = await resolveFavorite(id)
        setFav(isFav)
      }
    } finally {
      setLoading(false)
    }
  }, [id])

  React.useEffect(()=>{ load() },[load])

  // --- temporizador ---
  React.useEffect(() => {
    // Preferimos ends_in_seconds si el backend lo expone; si no, calculamos con end_at
    if (a?.ends_in_seconds != null) {
      let s = Number(a.ends_in_seconds) || 0
      if (s <= 0) { setTimeLeft(a?.current_price > 0 ? 'Finalizada' : 'Aún no iniciada'); return }
      const tick = () => {
        if (s <= 0) { setTimeLeft('Finalizada'); return }
        const h = Math.floor(s / 3600)
        const m = Math.floor((s % 3600) / 60)
        const sec = s % 60
        setTimeLeft(`${h}h ${m}m ${sec}s`)
        s -= 1
      }
      tick()
      const t = setInterval(tick, 1000)
      return ()=> clearInterval(t)
    }

    if (!a?.end_at) { setTimeLeft(a?.current_price > 0 ? 'Finalizada' : 'Aún no iniciada'); return }
    const updateCountdown = () => {
      const diff = new Date(a.end_at) - new Date()
      if (diff <= 0) { setTimeLeft('Finalizada'); return }
      const h = Math.floor(diff / (1000 * 60 * 60))
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const s = Math.floor((diff % (1000 * 60)) / 1000)
      setTimeLeft(`${h}h ${m}m ${s}s`)
    }
    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [a?.ends_in_seconds, a?.end_at, a?.current_price])

  // --- reglas de puja ---
  // Primera puja: mínimo 20 (entero). Siguientes: al menos +1 respecto al precio actual (enteros).
  const current = Number(a?.current_price || 0)
  const minNext = current > 0 ? (current + 1) : 20

  // ¿está finalizada?
  const finished = (a?.status && a.status !== 'active')
    || (a?.ends_in_seconds != null && Number(a.ends_in_seconds) <= 0)
    || (!!a?.end_at && new Date(a.end_at) <= new Date())

  // --- actions ---
  async function submitBid(e){
    e.preventDefault()
    if(!Auth.isLogged()) return alert('Inicia sesión para pujar')
    if(finished) return alert('La subasta ya finalizó')

    const val = parseInt(amount, 10)
    if (Number.isNaN(val)) return alert('Introduce una cantidad entera')
    if (val < minNext)     return alert(`La puja mínima ahora es de ${minNext} €`)

    try {
      await AuctionsAPI.bid(a.id, val)
      setAmount('')
      await load() // traerá current_price y (si tu backend lo hace) ends_in_seconds renovados (24h)
    } catch(err){
      alert(err.message || 'No se pudo registrar la puja')
    }
  }

  async function toggleFav(){
    if(!Auth.isLogged()) return alert('Inicia sesión para usar favoritos')
    try{
      const r = await FavoritesAPI.toggle(a.id)
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
        <div className="text-sm opacity-70 mt-1">
          Termina en: <b>{timeLeft}</b>{current === 0 && !finished ? ' (empieza con la primera puja ≥ 20€)' : ''}
        </div>

        <form onSubmit={submitBid} className="flex gap-2">
          <input
            className="input"
            type="number"
            step="1"
            min={minNext}
            value={amount}
            onChange={e=>setAmount(e.target.value)}
            placeholder={`≥ ${minNext}`}
            disabled={finished}
          />
          <button className="btn" disabled={finished}>Pujar</button>
        </form>

        <button onClick={toggleFav} className="btn">
          {fav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        </button>
      </div>
    </div>
  )
}
