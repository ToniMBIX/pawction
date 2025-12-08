// frontend/src/pages/AuctionDetail.jsx
import React from 'react'
import { useParams } from 'react-router-dom'
import { AuctionsAPI, FavoritesAPI, assetUrl } from '../lib/api.js'
import { Auth } from '../lib/auth.js'

export default function AuctionDetail() {
  const { id } = useParams()

  const [a, setA] = React.useState(null)
  const [fav, setFav] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [timeLeft, setTimeLeft] = React.useState('—')
  const [amount, setAmount] = React.useState('')

  // ---------------------------------------------------------------------
  // ESTE ES EL CAMBIO IMPORTANTE ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
  // Eliminamos resolveFavorite y validamos *exclusivamente* via backend
  // ---------------------------------------------------------------------

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await AuctionsAPI.get(id)

      setA(data)

      // backend SIEMPRE manda is_favorite (lo arreglamos antes)
      setFav(!!data.is_favorite)

    } finally {
      setLoading(false)
    }
  }, [id])

  React.useEffect(() => {
    load()
  }, [load])

  // ---------------------------------------------------------------------
  // TEMPORIZADOR: NO toca "fav", así prevenimos sobrescribir estado
  // ---------------------------------------------------------------------
  React.useEffect(() => {
    if (!a) return

    if (a.ends_in_seconds != null) {
      let s = Number(a.ends_in_seconds)

      const tick = () => {
        if (s <= 0) {
          setTimeLeft("Finalizada")
          return
        }
        const h = Math.floor(s / 3600)
        const m = Math.floor((s % 3600) / 60)
        const sec = s % 60
        setTimeLeft(`${h}h ${m}m ${sec}s`)
        s -= 1
      }

      tick()
      const t = setInterval(tick, 1000)
      return () => clearInterval(t)
    }
  }, [a])

  // ---------------------------------------------------------------------
  // Toggle favoritos
  // ---------------------------------------------------------------------
  async function toggleFav() {
    if (!Auth.isLogged()) return alert("Inicia sesión para usar favoritos")

    try {
      const r = await FavoritesAPI.toggle(a.id)
      setFav(!!r.favorited)
    } catch (e) {
      alert(e.message || "No se pudo actualizar favorito")
    }
  }

  // ---------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------
  if (loading || !a) return <div>Cargando…</div>

  const rawImg =
    a?.product?.animal?.photo_url ||
    a?.image_url ||
    a?.photo_url

  const img = assetUrl(rawImg) || '/placeholder.jpg'

  const current = Number(a.current_price || 20)
  const minNext = current > 20 ? current + 1 : 20

  const finished =
    a.status !== 'active' ||
    (a.ends_in_seconds != null && Number(a.ends_in_seconds) <= 0)

  async function submitBid(e) {
    e.preventDefault()
    if (!Auth.isLogged()) return alert("Inicia sesión para pujar")

    const bid = parseInt(amount, 10)
    if (isNaN(bid) || bid < minNext) {
      return alert(`La puja mínima ahora es ${minNext}€`)
    }

    await AuctionsAPI.bid(a.id, bid)
    setAmount("")
    await load()
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <img
          src={img}
          className="w-full max-h-[420px] object-cover rounded-xl"
          onError={(ev) => (ev.target.src = "/placeholder.jpg")}
        />
      </div>

      <div className="space-y-3">
        <h1 className="text-2xl font-bold">{a.title}</h1>

        {a.description && <p className="opacity-80">{a.description}</p>}

        <div>
          Precio actual: <b>{current} €</b>
        </div>

        <div className="text-sm opacity-70">
          Termina en: <b>{timeLeft}</b>
        </div>

        <form onSubmit={submitBid} className="flex gap-2">
          <input
            className="input"
            type="number"
            min={minNext}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button className="btn">Pujar</button>
        </form>

        {/* BOTÓN ARREGLADO */}
        <button onClick={toggleFav} className="btn">
          {fav ? "Quitar de favoritos" : "Agregar a favoritos"}
        </button>
        {/* BOTONES PDF & QR (solo mostrar si existen) */}
<div className="space-y-2 mt-4">

  {/* Ver PDF */}
  {a.document_url && (
    <a
      href={assetUrl(a.document_url)}
      target="_blank"
      className="btn bg-blue-600 text-white w-full text-center"
    >
      Ver PDF
    </a>
  )}

  {/* Ver QR */}
  {a.qr_url && (
    <a
      href={assetUrl(a.qr_url)}
      target="_blank"
      className="btn bg-green-600 text-white w-full text-center"
    >
      Ver QR
    </a>
  )}

</div>

      </div>
    </div>
  )
}
