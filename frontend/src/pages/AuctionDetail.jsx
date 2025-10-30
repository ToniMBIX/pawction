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
    if (Auth.token()) AuthAPI.me().then(u => setUserFavs(u.favorites?.map(f => f.auction_id) || []))
  }, [id])

  const toggleFav = async () => {
    if (!Auth.token()) {
      alert('Debes iniciar sesión para usar favoritos')
      return
    }
    try {
      const r = await FavoritesAPI.toggle(id)
      setUserFavs(r.favorites)
    } catch (e) {
      alert('Error al actualizar favorito')
    }
  }

  if (!auction) return <p>Cargando...</p>

  const isFav = userFavs.includes(auction.id)

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
    </div>
  )
}
