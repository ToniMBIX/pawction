import React from 'react'
import { Link } from 'react-router-dom'
import {
  AuctionsAPI,
  AuthAPI,
  assetUrl,
  PLACEHOLDER_IMG,
} from '../lib/api.js'
import { Auth } from '../lib/auth.js'

function AuctionCard({ auction, compact = false }) {
  const raw =
    auction?.product?.animal?.photo_url ||
    auction?.image_url ||
    auction?.photo_url

  const img = assetUrl(raw) || PLACEHOLDER_IMG

  const price =
    auction.current_price && auction.current_price > 0
      ? auction.current_price
      : auction.starting_price || 20

  const finished = auction.status === 'finished'

  return (
    <Link
      to={`/auctions/${auction.id}`}
      className={`card card-hover group overflow-hidden p-0 ${
        compact ? 'min-w-[260px] max-w-[260px]' : ''
      }`}
    >
      <div className="relative">
        <img
          src={img}
          alt={auction.title || 'Subasta Pawction'}
          className={`w-full object-cover transition duration-500 group-hover:scale-105 ${
            compact ? 'h-36' : 'h-52'
          }`}
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

        {!finished && (
          <div className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-emerald-700 shadow">
            {price} €
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="line-clamp-2 text-lg font-bold text-slate-900">
          {auction.title || 'Subasta solidaria'}
        </h3>

        {auction.description && !compact && (
          <p className="mt-2 line-clamp-2 text-sm text-slate-500">
            {auction.description}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">
              Precio actual
            </p>

            <p className="text-lg font-black text-slate-900">
              {price} €
            </p>
          </div>

          <span className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 transition group-hover:bg-emerald-100 group-hover:text-emerald-700">
            Ver detalle
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function Home() {
  const [items, setItems] = React.useState([])
  const [participating, setParticipating] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      setLoading(true)

      try {
        const r = await AuctionsAPI.list()
        const payload = r.data || r
        const list = Array.isArray(payload)
          ? payload
          : payload.data || []

        setItems(list)
      } catch {
        setItems([])
      } finally {
        setLoading(false)
      }

      if (Auth.isLogged()) {
        try {
          const r = await AuthAPI.participatingAuctions()
          const list = Array.isArray(r) ? r : r.data || []
          setParticipating(list)
        } catch {
          setParticipating([])
        }
      }
    }

    load()
  }, [])

  const activeItems = items.filter(a => a.status !== 'finished')

  return (
    <div className="space-y-14">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-14 text-white shadow-2xl sm:px-10 lg:px-14">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-20 left-20 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <span className="inline-flex rounded-full bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300 ring-1 ring-emerald-400/20">
              Subastas solidarias · Pawction
            </span>

            <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Puja por packs únicos y ayuda a proteger animales.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Pawction une subastas online, adopción responsable y
              apoyo medioambiental. Cada pack incluye productos
              personalizados y un QR con información del animal.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/auctions" className="btn">
                Explorar subastas
              </Link>

              {!Auth.isLogged() && (
                <Link to="/register" className="btn-secondary">
                  Crear cuenta
                </Link>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl bg-white p-5 text-slate-900">
                <div className="text-3xl font-black">
                  50%
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Apoyo a Greenpeace
                </p>
              </div>

              <div className="rounded-3xl bg-emerald-400 p-5 text-emerald-950">
                <div className="text-3xl font-black">
                  QR
                </div>
                <p className="mt-1 text-sm">
                  Acceso al PDF del animal
                </p>
              </div>

              <div className="col-span-2 rounded-3xl bg-slate-900 p-5 ring-1 ring-white/10">
                <p className="text-sm text-slate-300">
                  Cada subasta ayuda a financiar iniciativas de
                  protección animal y medioambiental.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {Auth.isLogged() && participating.length > 0 && (
        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="page-title">
                Subastas en las que participas
              </h2>

              <p className="muted mt-1">
                Sigue tus pujas activas y no pierdas el contador.
              </p>
            </div>

            <Link to="/auctions" className="btn-secondary">
              Ver todas
            </Link>
          </div>

          <div className="flex gap-5 overflow-x-auto pb-3">
            {participating.map(a => (
              <AuctionCard key={a.id} auction={a} compact />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="page-title">
              Subastas activas
            </h2>

            <p className="muted mt-1">
              Packs solidarios disponibles ahora mismo.
            </p>
          </div>

          <Link to="/auctions" className="btn-secondary">
            Ver catálogo
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="card animate-pulse">
                <div className="h-44 rounded-2xl bg-slate-200" />
                <div className="mt-4 h-5 w-3/4 rounded bg-slate-200" />
                <div className="mt-3 h-4 w-1/2 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : activeItems.length === 0 ? (
          <div className="card text-center">
            <h3 className="text-xl font-bold">
              No hay subastas activas
            </h3>

            <p className="mt-2 text-slate-500">
              Pronto aparecerán nuevos packs solidarios.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {activeItems.slice(0, 6).map(a => (
              <AuctionCard key={a.id} auction={a} />
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <div className="card">
          <div className="text-3xl">🐾</div>
          <h3 className="mt-3 text-lg font-bold">
            Adopción responsable
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Cada pack conecta con la historia de un animal y
            visibiliza su adopción.
          </p>
        </div>

        <div className="card">
          <div className="text-3xl">🌍</div>
          <h3 className="mt-3 text-lg font-bold">
            Impacto medioambiental
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            El 50% del beneficio se destina a apoyar iniciativas
            vinculadas a Greenpeace.
          </p>
        </div>

        <div className="card">
          <div className="text-3xl">🔒</div>
          <h3 className="mt-3 text-lg font-bold">
            Pago seguro
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Las compras se procesan con Stripe y confirmación
            automática del pedido.
          </p>
        </div>
      </section>
    </div>
  )
}