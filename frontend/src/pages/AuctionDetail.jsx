import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { AuctionsAPI, FavoritesAPI } from '../lib/api.js'
import { Auth } from '../lib/auth.js'

function Countdown({ endAt }) {
  if (!endAt) return null
  const [left, setLeft] = React.useState(() => new Date(endAt) - Date.now())
  React.useEffect(() => {
    const t = setInterval(() => setLeft(new Date(endAt) - Date.now()), 1000)
    return () => clearInterval(t)
  }, [endAt])
  if (left <= 0) return <div className="text-red-600 font-semibold">Finalizada</div>
  const s = Math.floor(left / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return <div className="text-sm opacity-80">Termina en: {h}h {m}m {sec}s</div>
}

export default function AuctionDetail() {
  const { id } = useParams()
  const [auction, setAuction] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [amount, setAmount] = React.useState('')
  const [placing, setPlacing] = React.useState(false)
  const [isFav, setIsFav] = React.useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const a = await AuctionsAPI.get(id)
      setAuction(a)
      setIsFav(!!a.is_favorite)
    } catch (e) {
      console.error(e)
      setAuction(null)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { load() }, [id])

  const isStarted = !!auction?.end_at
  const minBid = isStarted ? (Number(auction?.current_price || 0) + 1) : 20

  const submitBid = async (e) => {
    e.preventDefault()
    if (!Auth.isLogged()) { alert('Debes iniciar sesión para pujar'); return }
    if (placing) return

    const val = Number(amount)
    if (isNaN(val)) { alert('Importe no válido'); return }
    if (!isStarted && val < 20) { alert('La primera puja debe ser al menos 20€'); return }
    if (isStarted && val <= Number(auction?.current_price || 0)) {
      alert(`La puja debe ser superior a ${auction.current_price}€`)
      return
    }

    setPlacing(true)
    try {
      const r = await AuctionsAPI.bid(Number(id), val) // backend devuelve { ok, auction }
      const updated = r.auction || r
      setAuction(updated)
      setAmount('')
    } catch (e) {
      alert(e.message || 'Error al pujar')
    } finally {
      setPlacing(false)
    }
  }

  const toggleFav = async () => {
    if (!Auth.isLogged()) { alert('Debes iniciar sesión'); return }
    try {
      const r = await FavoritesAPI.toggle(auction.id)
      // backend recomendado: { favorite: boolean }
      if (typeof r?.favorite !== 'undefined') setIsFav(!!r.favorite)
      else setIsFav(v => !v) // fallback
    } catch (e) {
      alert(e.message || 'No se pudo actualizar favorito')
    }
  }

  if (loading) return <div>Cargando…</div>
  if (!auction) return <div>No encontrada</div>

  const img = auction?.product?.animal?.photo_url || auction?.image_url || '/placeholder.jpg'

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <img
          src={img}
          alt=""
          className="w-full h-64 object-cover rounded-xl"
          onError={(e)=>{ e.currentTarget.src = '/placeholder.jpg' }}
        />
        {auction?.product?.animal?.info_url && (
          <a href={auction.product.animal.info_url} target="_blank" rel="noreferrer" className="text-sm underline mt-2 inline-block">
            Ver información del animal
          </a>
        )}
      </div>

      <div>
        <h1 className="text-2xl font-bold">{auction.title}</h1>
        {auction.description && <p className="opacity-80 mt-2">{auction.description}</p>}

        <div className="mt-3 text-sm">Precio actual: <b>{auction.current_price} €</b></div>
        <div className="mt-1 text-xs opacity-60">
          {isStarted
            ? <Countdown endAt={auction.end_at} />
            : 'Aún no ha comenzado. La primera puja (≥ 20€) inicia la cuenta atrás.'}
        </div>

        <form onSubmit={submitBid} className="mt-4 flex gap-2">
          <input
            className="input"
            type="number"
            step="0.01"
            min={minBid}
            value={amount}
            onChange={e=>setAmount(e.target.value)}
            placeholder={`Mínimo ${minBid}€`}
          />
          <button className="btn" disabled={placing || (Number(amount) < minBid)}>
            {isStarted ? 'Pujar' : 'Comenzar (≥ 20€)'}
          </button>
        </form>

        <div className="mt-3 flex items-center gap-3">
          <button className="text-sm underline" onClick={toggleFav}>
            {isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          </button>
          <Link to="/" className="text-sm underline opacity-70">Volver</Link>
        </div>
      </div>
    </div>
  )
}
