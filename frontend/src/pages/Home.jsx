import React from 'react'
import { Link } from 'react-router-dom'
import { AuctionsAPI, AuthAPI, assetUrl, PLACEHOLDER_IMG } from '../lib/api.js'
import { Auth } from '../lib/auth.js'

export default function Home() {
  const [items, setItems] = React.useState([])
  const [participating, setParticipating] = React.useState([])

  React.useEffect(() => {
    AuctionsAPI.list()
      .then((r) => {
        const list = Array.isArray(r) ? r : r.data || []
        setItems(list)
      })
      .catch(() => setItems([]))

    if (Auth.isLogged()) {
      AuthAPI.participatingAuctions()
        .then((r) => setParticipating(Array.isArray(r) ? r : []))
        .catch(() => setParticipating([]))
    }
  }, [])

  return (
    <div className="space-y-8">
      <section className="card">
        <h1 className="text-3xl font-extrabold mb-3">Bienvenido/a a Pawction</h1>
        <p className="opacity-80">
          Pawction es una plataforma solidaria donde puedes pujar por packs benéficos.
          Cada subasta ayuda a financiar iniciativas ambientales y de protección animal
          a través de nuestra colaboración con Greenpeace.
        </p>
      </section>

      {Auth.isLogged() && participating.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-bold">Subastas en las que participas</h2>
            <Link to="/auctions" className="text-sm underline">
              Ver todas
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-3">
            {participating.map((a) => {
              const raw = a?.product?.animal?.photo_url || a?.image_url || a?.photo_url
              const img = assetUrl(raw) || PLACEHOLDER_IMG

              return (
                <Link
                  key={a.id}
                  to={`/auctions/${a.id}`}
                  className="card min-w-[240px] max-w-[240px] hover:shadow-md transition"
                >
                  <img
                    src={img}
                    alt={a.title}
                    className="h-36 w-full object-cover rounded-xl mb-3"
                    onError={(ev) => {
                      ev.currentTarget.src = PLACEHOLDER_IMG
                    }}
                  />

                  <h3 className="font-bold line-clamp-2">{a.title}</h3>

                  <p className="text-sm opacity-75 mt-1">
                    Actual: {a.current_price || a.starting_price || 20} €
                  </p>

                  {a.ends_in_seconds !== null && (
                    <p className="text-xs opacity-60 mt-1">
                      Sigue activa
                    </p>
                  )}
                </Link>
              )
            })}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-2xl font-bold mb-3">Subastas activas</h2>

        {items.length === 0 ? (
          <p className="opacity-70">No hay subastas disponibles todavía.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((a) => {
              const raw = a?.product?.animal?.photo_url || a?.image_url || a?.photo_url
              const img = assetUrl(raw) || PLACEHOLDER_IMG

              return (
                <Link key={a.id} to={`/auctions/${a.id}`} className="card">
                  <img
                    src={img}
                    alt={a.title}
                    className="h-44 w-full object-cover rounded-xl mb-3"
                    onError={(ev) => {
                      ev.currentTarget.src = PLACEHOLDER_IMG
                    }}
                  />

                  <h3 className="font-bold">{a.title}</h3>

                  <p className="text-sm opacity-75 mt-1">
                    {a.status === 'finished'
                      ? 'Terminado'
                      : `Actual: ${a.current_price || a.starting_price || 20} €`}
                  </p>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}