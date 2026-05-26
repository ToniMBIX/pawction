import React from 'react'
import { Link } from 'react-router-dom'
import { AuctionsAPI, assetUrl, PLACEHOLDER_IMG } from '../lib/api.js'

function statusInfo(a) {
  const ends =
    a.ends_in_seconds === null || a.ends_in_seconds === undefined
      ? null
      : Number(a.ends_in_seconds)

  if (a.status === 'finished') {
    return {
      label: 'Finalizada',
      detail: 'Subasta cerrada',
      badge: 'badge-red',
    }
  }

  if (a.status === 'active' && !a.end_at) {
    return {
      label: 'Nueva',
      detail: 'Esperando primera puja',
      badge: 'badge-orange',
    }
  }

  if (a.status === 'active' && ends !== null && ends > 0) {
    const h = Math.floor(ends / 3600)
    const m = Math.floor((ends % 3600) / 60)
    const s = ends % 60

    return {
      label: 'Activa',
      detail: `${h}h ${m}m ${s}s restantes`,
      badge: 'badge-green',
    }
  }

  if (a.status === 'active' && ends !== null && ends <= 0) {
    return {
      label: 'Finalizando',
      detail: 'Cerrando subasta...',
      badge: 'badge-orange',
    }
  }

  return {
    label: 'Disponible',
    detail: 'Estado no disponible',
    badge: 'badge-orange',
  }
}

function AuctionCard({ auction }) {
  const raw =
    auction?.product?.animal?.photo_url ||
    auction?.image_url ||
    auction?.photo_url

  const img = assetUrl(raw) || PLACEHOLDER_IMG

  const price = Number(
    auction.current_price || auction.starting_price || 20
  )

  const info = statusInfo(auction)

  return (
    <Link
      to={`/auctions/${auction.id}`}
      className="card card-hover group overflow-hidden p-0"
    >
      <div className="relative">
        <img
          src={img}
          alt={auction.title || 'Subasta Pawction'}
          className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
          onError={ev => {
            ev.currentTarget.src = PLACEHOLDER_IMG
          }}
        />

        <div className="absolute left-3 top-3">
          <span className={`badge ${info.badge}`}>
            {info.label}
          </span>
        </div>

        <div className="absolute bottom-3 right-3 rounded-full bg-white/95 px-3 py-1 text-sm font-black text-slate-900 shadow">
          {price} €
        </div>
      </div>

      <div className="p-5">
        <h3 className="line-clamp-2 text-lg font-bold text-slate-900">
          {auction.title || 'Subasta solidaria'}
        </h3>

        {auction.description && (
          <p className="mt-2 line-clamp-2 text-sm text-slate-500">
            {auction.description}
          </p>
        )}

        <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500">
                Estado
              </p>

              <p className="text-sm font-bold text-slate-800">
                {info.detail}
              </p>
            </div>

            <span className="text-xs font-semibold text-emerald-700">
              Ver detalle →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function Auctions() {
  const [items, setItems] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [filter, setFilter] = React.useState('all')

  React.useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')

      try {
        const r = await AuctionsAPI.list()
        const payload = r.data || r
        const list = Array.isArray(payload)
          ? payload
          : payload.data || []

        setItems(list)
      } catch (err) {
        console.error(err)
        setError(err.message || 'No se pudieron cargar las subastas')
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  React.useEffect(() => {
    const t = setInterval(() => {
      setItems(prev =>
        prev.map(a => {
          if (a.status !== 'active') return a
          if (a.ends_in_seconds == null) return a

          const next = Number(a.ends_in_seconds) - 1

          return {
            ...a,
            ends_in_seconds: next > 0 ? next : 0,
          }
        })
      )
    }, 1000)

    return () => clearInterval(t)
  }, [])

  const filtered = items.filter(a => {
    if (filter === 'active') return a.status === 'active'
    if (filter === 'finished') return a.status === 'finished'
    return true
  })

  const activeCount = items.filter(a => a.status === 'active').length
  const finishedCount = items.filter(a => a.status === 'finished').length

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="badge badge-green">
              Catálogo Pawction
            </span>

            <h1 className="mt-4 page-title">
              Subastas solidarias
            </h1>

            <p className="mt-2 max-w-2xl text-slate-500">
              Explora packs únicos, puja por tu favorito y contribuye
              a iniciativas de protección animal y medioambiental.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex">
            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-center">
              <div className="text-2xl font-black text-emerald-700">
                {activeCount}
              </div>
              <div className="text-xs text-emerald-700">
                Activas
              </div>
            </div>

            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-center">
              <div className="text-2xl font-black text-slate-700">
                {finishedCount}
              </div>
              <div className="text-xs text-slate-500">
                Finalizadas
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {[
          ['all', 'Todas'],
          ['active', 'Activas'],
          ['finished', 'Finalizadas'],
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
              filter === value
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="h-48 rounded-2xl bg-slate-200" />
              <div className="mt-4 h-5 w-3/4 rounded bg-slate-200" />
              <div className="mt-3 h-4 w-1/2 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="card text-center">
          <div className="text-4xl">🐾</div>

          <h2 className="mt-3 text-xl font-bold">
            No hay subastas en esta categoría
          </h2>

          <p className="mt-2 text-slate-500">
            Prueba con otro filtro o vuelve más tarde.
          </p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(a => (
            <AuctionCard key={a.id} auction={a} />
          ))}
        </div>
      )}
    </div>
  )
}