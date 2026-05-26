import React from 'react'
import { Link } from 'react-router-dom'
import {
  BidsAPI,
  assetUrl,
  PLACEHOLDER_IMG,
} from '../lib/api.js'
import { Auth } from '../lib/auth.js'

export default function BidsHistory() {
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
        const r = await BidsAPI.mine()
        const list = Array.isArray(r) ? r : r.data || []
        setItems(list)
      } catch (err) {
        console.error(err)
        setError(err.message || 'No se pudo cargar el historial de pujas')
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
        Debes iniciar sesión para ver tu historial de pujas.
      </div>
    )
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="card animate-pulse flex gap-4">
            <div className="h-28 w-36 rounded-2xl bg-slate-200" />
            <div className="flex-1 space-y-3">
              <div className="h-5 w-2/3 rounded bg-slate-200" />
              <div className="h-4 w-1/3 rounded bg-slate-200" />
              <div className="h-4 w-1/2 rounded bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <span className="badge badge-green">
          Historial
        </span>

        <h1 className="mt-4 page-title">
          Tus pujas
        </h1>

        <p className="mt-2 max-w-2xl text-slate-500">
          Consulta todas las subastas en las que has participado y el importe
          de tus pujas.
        </p>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {!error && items.length === 0 && (
        <div className="card text-center">
          <div className="text-5xl">🔨</div>

          <h2 className="mt-4 text-xl font-black text-slate-900">
            Aún no has realizado ninguna puja
          </h2>

          <p className="mt-2 text-slate-500">
            Explora subastas activas y empieza a participar.
          </p>

          <Link to="/auctions" className="btn mt-5">
            Explorar subastas
          </Link>
        </div>
      )}

      {items.length > 0 && (
        <div className="space-y-4">
          {items.map(b => {
            const a = b.auction || null

            const raw =
              a?.product?.animal?.photo_url ||
              a?.image_url ||
              a?.photo_url

            const img = assetUrl(raw) || PLACEHOLDER_IMG

            const createdAt = b.created_at
              ? new Date(b.created_at).toLocaleString()
              : 'Fecha no disponible'

            const amount = Number(b.amount || 0)

            if (!a?.id) {
              return (
                <div
                  key={b.id}
                  className="card flex flex-col gap-4 opacity-75 sm:flex-row"
                >
                  <img
                    src={img}
                    alt="Subasta no disponible"
                    className="h-32 w-full rounded-2xl object-cover sm:w-44"
                    onError={ev => {
                      ev.currentTarget.src = PLACEHOLDER_IMG
                    }}
                  />

                  <div className="flex-1">
                    <span className="badge badge-red">
                      No disponible
                    </span>

                    <h3 className="mt-3 text-lg font-bold text-slate-900">
                      Subasta no disponible
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Tu puja: <b>{amount} €</b>
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {createdAt}
                    </p>
                  </div>
                </div>
              )
            }

            return (
              <Link
                to={`/auctions/${a.id}`}
                key={b.id}
                className="card card-hover flex flex-col gap-4 sm:flex-row"
              >
                <img
                  src={img}
                  alt={a.title || 'Subasta'}
                  className="h-32 w-full rounded-2xl object-cover sm:w-44"
                  onError={ev => {
                    ev.currentTarget.src = PLACEHOLDER_IMG
                  }}
                />

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`badge ${
                          a.status === 'finished'
                            ? 'badge-red'
                            : 'badge-green'
                        }`}
                      >
                        {a.status === 'finished'
                          ? 'Finalizada'
                          : 'Activa'}
                      </span>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {createdAt}
                      </span>
                    </div>

                    <h3 className="mt-3 text-xl font-black text-slate-900">
                      {a.title || 'Subasta sin título'}
                    </h3>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                    <div>
                      <p className="text-xs text-slate-500">
                        Tu puja
                      </p>

                      <p className="text-xl font-black text-slate-900">
                        {amount} €
                      </p>
                    </div>

                    <span className="text-sm font-semibold text-emerald-700">
                      Ver subasta →
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