import React from 'react'
import { Link } from 'react-router-dom'
import { FavoritesAPI } from '../lib/api.js'
import { Auth } from '../lib/auth.js'

export default function Favorites(){
  const [items, setItems] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(()=>{
    (async ()=>{
      try{
        if (!Auth.token()) { setItems([]); return }
        const list = await FavoritesAPI.list()
        setItems(Array.isArray(list) ? list : (list.data || []))
      } catch {
        setItems([])
      } finally {
        setLoading(false)
      }
    })()
  },[])

  if (!Auth.token()) return <div>Debes iniciar sesión para ver tus favoritos.</div>
  if (loading) return <div>Cargando…</div>

  return (
  <div>
    <h1 className="text-2xl font-bold mb-4">❤️ Mis Favoritos</h1>
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
      {items.map(a => {
        const img = a?.product?.animal?.photo_url || a?.image_url || '/placeholder.jpg'
        return (
          <Link to={`/auctions/${a.id}`} key={a.id} className="card hover:shadow-xl transition-all">
            <img src={img} alt="" className="w-full h-44 object-cover rounded-xl" />
            <div className="mt-3">
              <h3 className="font-bold text-lg">{a.title}</h3>
              <div className="mt-1 text-sm opacity-80">Precio actual: <b>{a.current_price} €</b></div>
            </div>
          </Link>
        )
      })}
      {items.length === 0 && (
        <div className="col-span-full text-center text-sm opacity-70">
          No tienes favoritos todavía.
        </div>
      )}
    </div>
  </div>
)

}
