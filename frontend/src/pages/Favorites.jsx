import React from 'react'
import { Link } from 'react-router-dom'
import {
  FavoritesAPI,
  assetUrl,
  PLACEHOLDER_IMG,
} from '../lib/api.js'
import { Auth } from '../lib/auth.js'

export default function Favorites() {
  const [items, setItems] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    async function load() {
      if (!Auth.isLogged()) {
        setLoading(false)
        setItems([])
        return
      }

      setLoading(true)
      setError('')

      try {
        const r = await FavoritesAPI.list()
        const list = Array.isArray(r) ? r : r.data || []
        setItems(list)
      } catch (err) {
        console.error(err)
        setError(err.message || 'No se pudieron cargar los favoritos')
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (!Auth.isLogged()) {
    return (
      <div className="card mx-auto max-w-xl text-center">
        Debes iniciar sesión para ver tus favoritos.
      </div>
    )
  }

  if (loading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="card animate-pulse">
            <div className="h-44 rounded-2xl bg-slate-200" />
            <div className="mt-4 h-5 w-3/4 rounded bg-slate-200" />
            <div className="mt-3 h-4 w-1/2 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <span className="badge badge-green">
          Mis favoritos
        </span>

        <h1 className="mt-4 page-title">
          Subastas guardadas
        </h1>

        <p className="mt-2 max-w-2xl text-slate-500">
          Aquí tienes las subastas que has marcado para seguir de cerca.
        </p>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {!error && items.length === 0 && (
        <div className="card text-center">
          <div className="text-5xl">🤍</div>

          <h2 className="mt-4 text-xl font-black text-slate-900">
            Aún no tienes favoritos
          </h2>

          <p className="mt-2 text-slate-500">
            Guarda subastas para encontrarlas rápidamente más tarde.
          </p>

          <Link to="/auctions" className="btn mt-5">
            Explorar subastas
          </Link>
        </div>
      )}

      {items.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(a => {
            const raw =
              a?.product?.animal?.photo_url ||
              a?.image_url ||
              a?.photo_url

            const img = assetUrl(raw) || PLACEHOLDER_IMG

            const price = Number(
              a.current_price || a.starting_price || 0
            )

            const finished = a.status === 'finished'

            return (
              <Link
                to={`/auctions/${a.id}`}
                key={a.id}
                className="card card-hover group overflow-hidden p-0"
              >
                <div className="relative">
                  <img
                    src={img}
                    alt={a.title || 'Subasta favorita'}
                    className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
                    onError={ev => {
                      ev.currentTarget.src = PLACEHOLDER_IMG
                    }}
                  />

                  <div className="absolute left-3 top-3">
                    <span
                      className={`badge ${
                        finished ? 'badge-red' : 'badge-green'
                      }`}
                    >
                      {finished ? 'Finalizada' : 'Activa'}
                    </span>
                  </div>

                  <div className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-sm font-bold text-pink-600 shadow">
                    ❤️
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="line-clamp-2 text-lg font-bold text-slate-900">
                    {a.title || 'Subasta sin título'}
                  </h3>

                  <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <div>
                      <p className="text-xs text-slate-500">
                        Precio actual
                      </p>

                      <p className="text-lg font-black text-slate-900">
                        {price} €
                      </p>
                    </div>

                    <span className="text-xs font-semibold text-emerald-700">
                      Ver detalle →
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}