import React from 'react'
import { useParams } from 'react-router-dom'
import { AuctionsAPI, FavoritesAPI, AuthAPI } from '../lib/api.js'
import { Auth } from '../lib/auth.js'

export default function AuctionDetail(){
  const { id } = useParams()
  const [auction, setAuction] = React.useState(null)
  const [userFavs, setUserFavs] = React.useState([])

  React.useEffect(()=>{
    AuctionsAPI.get(id).then(setAuction)
if (Auth.token()) AuthAPI.me().then(u => setUserFavs(u.favorites?.map(Number) || []))
  }, [id])

  const toggleFav = async () => {
  if (!Auth.token()) {
    alert('Debes iniciar sesión para usar favoritos')
    return
  }
  try {
    const r = await FavoritesAPI.toggle(id) // id es string de la URL
    const auctionId = Number(id)            // normaliza a número para el includes()
    setUserFavs(prev => {
      if (r.favorite) {
        // lo marcó como favorito → añade si no existe
        return prev.includes(auctionId) ? prev : [...prev, auctionId]
      } else {
        // lo quitó → filtra
        return prev.filter(x => x !== auctionId)
      }
    })
  } catch (e) {
    alert('Error al actualizar favorito')
  }
}


  if (!auction) return <p>Cargando...</p>

const isFav = userFavs.includes(Number(auction?.id))
const isStarted = !!auction?.end_at
const minBid = isStarted ? (Number(auction?.current_price || 0) + 1) : 20
function Countdown({ endAt }) {
  const [left, setLeft] = React.useState(() => new Date(endAt) - Date.now())
  React.useEffect(()=>{
    const t = setInterval(()=> setLeft(new Date(endAt) - Date.now()), 1000)
    return ()=>clearInterval(t)
  },[endAt])
  if (!endAt) return null
  if (left <= 0) return <div className="text-red-600 font-semibold">Finalizada</div>
  const s = Math.floor(left/1000)
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60
  return <div className="text-sm opacity-80">Termina en: {h}h {m}m {sec}s</div>
}

  const img =
    auction?.product?.animal?.photo_url ||
    auction?.image_url ||
    'https://picsum.photos/seed/paw-placeholder/600/400'

  return (
    <div className="card max-w-2xl mx-auto">
      <img src={img} alt={auction.title} className="w-full h-64 object-cover rounded-xl" />
      <h1 className="text-2xl font-bold mt-4">{auction.title}</h1>
      <p className="mt-2 text-sm opacity-80">{auction.description}</p>
      <div className="flex items-center gap-3 mt-4">
        <button onClick={toggleFav} className="btn">
          {isFav ? '★ Quitar de favoritos' : '☆ Agregar a favoritos'}
        </button>
      </div>
      {!isStarted ? (
  <div className="text-sm opacity-70 mb-2">Aún no ha comenzado. La primera puja la inicia (mín. 20€).</div>
) : (
  <Countdown endAt={auction.end_at} />
)}

<form onSubmit={submitBid} className="mt-3 flex gap-2">
  <input
    className="input"
    type="number"
    step="0.01"
    min={minBid}
    value={amount}
    onChange={e=>setAmount(parseFloat(e.target.value))}
    placeholder={`Mínimo ${minBid}€`}
  />
  <button className="btn" disabled={isNaN(amount) || amount < minBid}>
    {isStarted ? 'Pujar' : 'Comenzar (≥ 20€)'}
  </button>
</form>
    </div>
  )
}
