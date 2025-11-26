// frontend/src/pages/Auctions.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { AuctionsAPI, assetUrl } from '../lib/api.js'

export default function Auctions() {
  const [items, setItems] = React.useState([])

  React.useEffect(() => {
    AuctionsAPI.list()
      .then(r => {
        const list = Array.isArray(r) ? r : r.data || []
        setItems(list)
      })
      .catch(() => setItems([]))
  }, [])

  return (
    <div className="space-y-8">

      {/* 🟣 BLOQUE DE BIENVENIDA */}
      <div className="text-center bg-gray-900/40 p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Bienvenido/a a Pawction 🐾</h1>

        <p className="text-sm opacity-80 max-w-2xl mx-auto leading-relaxed">
          Pawction es una plataforma solidaria donde puedes pujar por packs benéficos.  
          Cada subasta ayuda a financiar iniciativas ambientales y de protección animal
          a través de nuestra colaboración con Greenpeace.
          <br /><br />
          Explora las subastas activas, realiza una puja o añade tus favoritas para seguirlas de cerca.
          ¡Gracias por formar parte de esta causa! 💚
        </p>
      </div>

      {/* 🟣 GRID DE SUBASTAS */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map(a => {
          const raw =
            a?.product?.animal?.photo_url ||
            a?.image_url ||
            a?.photo_url

          const img = assetUrl(raw) || '/placeholder.jpg'

          return (
            <Link to={`/auctions/${a.id}`} key={a.id} className="card">
              <img
                src={img}
                alt=""
                className="w-full h-40 object-cover rounded-xl"
                onError={ev => {
                  ev.currentTarget.src = '/placeholder.jpg'
                }}
              />
              <div className="mt-3">
                <h3 className="font-bold">{a.title}</h3>
                <div className="mt-2 text-sm">
                  Actual: <b>{a.current_price || 0} €</b>
                </div>
              </div>
            </Link>
          )
        })}

        {items.length === 0 && (
          <div className="col-span-full text-center text-sm opacity-70">
            No hay subastas disponibles todavía.
          </div>
        )}
      </div>
    </div>
  )
}
