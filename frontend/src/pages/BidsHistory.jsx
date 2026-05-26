import React from 'react'
import { Link } from 'react-router-dom'
import { BidsAPI, assetUrl } from '../lib/api.js'
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
      <div className="card max-w-xl mx-auto text-center">
        Debes iniciar sesión para ver tu historial de pujas.
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-10 opacity-70">
        Cargando historial de pujas...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Historial de pujas</h1>

      {error && (
        <div className="rounded-xl border border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!error && items.length === 0 && (
        <div className="card text-center opacity-70">
          Aún no has realizado ninguna puja.
        </div>
      )}

      {items.map(b => {
        const a = b.auction || null

        const raw =
          a?.product?.animal?.photo_url ||
          a?.image_url ||
          a?.photo_url

        const img = assetUrl(raw) || '/placeholder.jpg'

        const createdAt = b.created_at
          ? new Date(b.created_at).toLocaleString()
          : 'Fecha no disponible'

        if (!a?.id) {
          return (
            <div key={b.id} className="card flex gap-4 opacity-75">
              <img
                src={img}
                alt="Subasta no disponible"
                className="w-32 h-24 object-cover rounded-xl"
                onError={ev => {
                  ev.currentTarget.src = '/placeholder.jpg'
                }}
              />

              <div className="flex-1">
                <div className="font-semibold">
                  Subasta no disponible
                </div>

                <div className="text-sm opacity-80">
                  Tu puja: <b>{Number(b.amount || 0)} €</b>
                </div>

                <div className="text-xs opacity-60">
                  Fecha: {createdAt}
                </div>
              </div>
            </div>
          )
        }

        return (
          <Link
            to={`/auctions/${a.id}`}
            key={b.id}
            className="card flex gap-4 hover:shadow-lg transition-all"
          >
            <img
              src={img}
              alt={a.title || 'Subasta'}
              className="w-32 h-24 object-cover rounded-xl"
              onError={ev => {
                ev.currentTarget.src = '/placeholder.jpg'
              }}
            />

            <div className="flex-1">
              <div className="font-semibold">
                {a.title || 'Subasta sin título'}
              </div>

              <div className="text-sm opacity-80">
                Tu puja: <b>{Number(b.amount || 0)} €</b>
              </div>

              <div className="text-xs opacity-60">
                Fecha: {createdAt}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}