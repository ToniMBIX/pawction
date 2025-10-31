import React from 'react'
import { Link } from 'react-router-dom'
import { BidsAPI } from '../lib/api.js'
import { Auth } from '../lib/auth.js'

export default function BidsHistory(){
  const [bids, setBids] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(()=>{
    (async ()=>{
      try{
        if (!Auth.token()) { setBids([]); return }
        const r = await BidsAPI.mine()
        setBids(Array.isArray(r) ? r : (r.data || []))
      } catch {
        setBids([])
      } finally {
        setLoading(false)
      }
    })()
  },[])

  if (!Auth.token()) return <div>Debes iniciar sesión para ver tu historial de pujas.</div>
  if (loading) return <div>Cargando…</div>

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
      {bids.map(b => {
        const a = b.auction || {}
        const img = a?.product?.animal?.photo_url || a?.image_url || '/placeholder.jpg'
        return (
          <div key={b.id} className="card">
            <img src={img} alt="" className="w-full h-40 object-cover rounded-xl" />
            <div className="mt-3">
              <Link to={`/auctions/${a.id}`} className="font-bold underline">{a.title || 'Subasta'}</Link>
              <div className="mt-1 text-sm">Tu puja: <b>{b.amount} €</b></div>
              <div className="text-xs opacity-60">Fecha: {new Date(b.created_at).toLocaleString()}</div>
            </div>
          </div>
        )
      })}
      {bids.length === 0 && (
        <div className="col-span-full text-center text-sm opacity-70">
          Aún no has realizado pujas.
        </div>
      )}
    </div>
  )
}
