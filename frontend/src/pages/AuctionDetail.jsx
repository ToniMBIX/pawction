import React from 'react'
import { useParams } from 'react-router-dom'
import { AuctionsAPI, FavoritesAPI } from '../lib/api.js'
import { Auth } from '../lib/auth.js'

export default function AuctionDetail(){
  const { id } = useParams()
  const [a, setA] = React.useState(null)
  const [isFav, setIsFav] = React.useState(false)
  const [amount, setAmount] = React.useState('')
  const [left, setLeft] = React.useState('') // texto de cuenta atrás
  const [loading, setLoading] = React.useState(false)

  const load = async () => {
    const r = await AuctionsAPI.get(id)
    // API devuelve { data, is_favorite }
    setA(r.data)
    setIsFav(!!r.is_favorite)
  }

  React.useEffect(()=>{ load() }, [id])

  // Temporizador
  React.useEffect(()=>{
    if (!a?.end_at) { setLeft('Comienza con la primera puja de 20€'); return }
    const tick = () => {
      const end = new Date(a.end_at).getTime()
      const now = Date.now()
      const diff = end - now
      if (diff <= 0) { setLeft('Finalizada'); return }
      const h = Math.floor(diff/3600000)
      const m = Math.floor((diff%3600000)/60000)
      const s = Math.floor((diff%60000)/1000)
      setLeft(`${h}h ${m}m ${s}s`)
    }
    tick()
    const i = setInterval(tick, 1000)
    return ()=>clearInterval(i)
  }, [a?.end_at])

  const toggleFav = async () => {
    if (!Auth.isLogged()) { alert('Inicia sesión para usar favoritos'); return }
    try {
      const r = await FavoritesAPI.toggle(a.id)
      setIsFav(!!r.favorited)
    } catch(e){ alert(e.message) }
  }

  const submitBid = async (e) => {
    e.preventDefault()
    if (!Auth.isLogged()) { alert('Inicia sesión para pujar'); return }
    const v = parseFloat(amount)
    if (isNaN(v)) { alert('Introduce una cantidad'); return }

    // Validación mínima en cliente (el servidor ya valida):
    const curr = parseFloat(a.current_price || 0)
    if (curr <= 0 && v < 20) { alert('La primera puja debe ser al menos 20€'); return }
    if (curr > 0 && v <= curr) { alert('La puja debe superar el precio actual'); return }

    try {
      setLoading(true)
      const r = await AuctionsAPI.bid(a.id, v)
      setA(r.auction) // backend devuelve auction actualizado
      setAmount('')
    } catch(e){ alert(e.message) } finally { setLoading(false) }
  }

  if (!a) return <div>Cargando…</div>

  const img = a?.product?.animal?.photo_url || a?.image_url || '/placeholder.jpg'

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <img src={img} alt="" className="w-full rounded-xl object-cover" />
        <div className="mt-2 text-sm">
          {a?.product?.animal?.name && <>Animal: <b>{a.product.animal.name}</b></>}
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold">{a.title}</h1>
        <div className="opacity-70">{a.description}</div>

        <div className="mt-4">
          <div>Precio actual: <b>{a.current_price} €</b></div>
          <div className="text-sm opacity-70">Termina en: {left}</div>
        </div>

        <div className="flex gap-3 mt-4">
          <button onClick={toggleFav} className="btn">
            {isFav ? '★ Quitar de favoritos' : '☆ Agregar a favoritos'}
          </button>
        </div>

        <form onSubmit={submitBid} className="mt-4 flex gap-2">
          <input className="input" placeholder="Tu puja (€)"
            value={amount} onChange={e=>setAmount(e.target.value)} />
          <button className="btn" disabled={loading}>
            {loading ? 'Pujando…' : 'Pujar'}
          </button>
        </form>
      </div>
    </div>
  )
}
