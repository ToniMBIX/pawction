import React from 'react'
import { useParams } from 'react-router-dom'
import { AuctionsAPI, FavoritesAPI, BidsAPI } from '../lib/api.js'
import { Auth } from '../lib/auth.js'

function fmtLeft(endAt) {
  if (!endAt) return ''
  const end = new Date(endAt)
  const now = new Date()
  let s = Math.max(0, Math.floor((end - now) / 1000))
  const hh = String(Math.floor(s / 3600)).padStart(2, '0')
  s %= 3600
  const mm = String(Math.floor(s / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

export default function AuctionDetail(){
  const { id } = useParams()
  const [a, setA] = React.useState(null)
  const [isFav, setIsFav] = React.useState(false)
  const [amount, setAmount] = React.useState('')
  const [left, setLeft] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const load = async () => {
    const r = await AuctionsAPI.get(id)
    setA(r.data)
    setIsFav(!!r.is_favorite)
  }

  React.useEffect(() => { load() }, [id])

  // Cuenta atrás
  React.useEffect(() => {
    if (!a?.end_at) return
    const t = setInterval(() => setLeft(fmtLeft(a.end_at)), 1000)
    return () => clearInterval(t)
  }, [a?.end_at])

  const toggleFav = async () => {
    if (!Auth.isLogged()) { alert('Inicia sesión para gestionar favoritos'); return }
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

    const curr = parseFloat(a.current_price || 0)
    if (curr <= 0 && v < 20) { alert('La primera puja debe ser al menos 20€'); return }
    if (curr > 0 && v <= curr) { alert('La puja debe superar el precio actual'); return }

    try {
      setLoading(true)
      const r = await BidsAPI.create(a.id, v)
      setAmount('')
      setA(r.auction)
    } catch(e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (!a) return <div className="p-6">Cargando…</div>

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{a.title}</h1>
        <button onClick={toggleFav} className={`px-3 py-1 rounded ${isFav ? 'bg-pink-200' : 'bg-gray-200'}`}>
          {isFav ? '★ Favorito' : '☆ Favorito'}
        </button>
      </div>

      <img src={a.image_url || (a.product?.animal?.image_url)} alt={a.title} className="w-full rounded-xl" />

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-gray-50">
          <div className="text-sm text-gray-500">Precio actual</div>
          <div className="text-3xl font-semibold">{(a.current_price || 0).toFixed(2)} €</div>
        </div>
        <div className="p-4 rounded-xl bg-gray-50">
          <div className="text-sm text-gray-500">Termina en</div>
          <div className="text-3xl font-semibold">{left || '—'}</div>
        </div>
      </div>

      {a.status === 'active' ? (
        <form onSubmit={submitBid} className="flex gap-3">
          <input
            type="number" step="0.01" min="0" value={amount}
            onChange={e => setAmount(e.target.value)}
            className="border rounded px-3 py-2 w-48"
            placeholder={a.current_price > 0 ? `> ${a.current_price}` : '≥ 20.00'}
          />
          <button disabled={loading} className="bg-black text-white px-4 py-2 rounded">
            {loading ? 'Pujando…' : 'Pujar'}
          </button>
        </form>
      ) : (
        <div className="text-green-700 font-medium">
          {a.payed ? 'Subasta finalizada y pagada ✅' : 'Subasta finalizada. Pendiente de pago.'}
        </div>
      )}
    </div>
  )
}
