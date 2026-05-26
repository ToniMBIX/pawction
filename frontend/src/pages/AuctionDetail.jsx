import React from 'react'
import { useParams } from 'react-router-dom'
import {
  AuctionsAPI,
  FavoritesAPI,
  assetUrl,
  PLACEHOLDER_IMG,
} from '../lib/api.js'
import { Auth } from '../lib/auth.js'

export default function AuctionDetail() {
  const { id } = useParams()

  const [a, setA] = React.useState(null)
  const [fav, setFav] = React.useState(false)

  const [loading, setLoading] = React.useState(true)
  const [pageError, setPageError] = React.useState('')

  const [timeLeft, setTimeLeft] = React.useState('—')

  const [amount, setAmount] = React.useState('')
  const [bidLoading, setBidLoading] = React.useState(false)

  const [toast, setToast] = React.useState({
    show: false,
    msg: '',
    type: '',
  })

  const notify = (msg, type = 'info') => {
    setToast({
      show: true,
      msg,
      type,
    })

    setTimeout(() => {
      setToast({
        show: false,
        msg: '',
        type: '',
      })
    }, 2500)
  }

  const load = React.useCallback(async () => {
    setLoading(true)
    setPageError('')

    try {
      const r = await AuctionsAPI.get(id)

      const data = r.data || r

      setA(data)
      setFav(!!data.is_favorite)
    } catch (err) {
      console.error(err)

      setPageError(
        err.message || 'No se pudo cargar la subasta'
      )
    } finally {
      setLoading(false)
    }
  }, [id])

  React.useEffect(() => {
    load()
  }, [load])

  React.useEffect(() => {
    if (!a) return

    if (a.ends_in_seconds != null) {
      let s = Number(a.ends_in_seconds)

      const tick = () => {
        if (s <= 0) {
          setTimeLeft('Finalizada')
          return
        }

        const h = Math.floor(s / 3600)
        const m = Math.floor((s % 3600) / 60)
        const sec = s % 60

        setTimeLeft(`${h}h ${m}m ${sec}s`)

        s -= 1
      }

      tick()

      const t = setInterval(tick, 1000)

      return () => clearInterval(t)
    }
  }, [a])

  async function toggleFav() {
    if (!Auth.isLogged()) {
      return notify(
        'Inicia sesión para usar favoritos',
        'warning'
      )
    }

    try {
      const r = await FavoritesAPI.toggle(a.id)

      setFav(!!r.favorited)

      notify(
        fav
          ? 'Eliminado de favoritos'
          : 'Añadido a favoritos',
        'success'
      )
    } catch (e) {
      notify(
        e.message || 'No se pudo actualizar favorito',
        'error'
      )
    }
  }

  async function submitBid(e) {
    e.preventDefault()

    if (!Auth.isLogged()) {
      return notify(
        'Inicia sesión para pujar',
        'warning'
      )
    }

    setBidLoading(true)

    try {
      await AuctionsAPI.bid(a.id, amount)

      setAmount('')

      notify(
        'Puja realizada correctamente 🎉',
        'success'
      )

      await load()
    } catch (err) {
      console.error(err)

      notify(
        err.message || 'No se pudo realizar la puja',
        'error'
      )
    } finally {
      setBidLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card animate-pulse">
          <div className="h-[420px] rounded-3xl bg-slate-200" />
        </div>

        <div className="card animate-pulse space-y-4">
          <div className="h-10 w-2/3 rounded bg-slate-200" />
          <div className="h-4 w-full rounded bg-slate-200" />
          <div className="h-4 w-5/6 rounded bg-slate-200" />
          <div className="h-28 rounded-3xl bg-slate-200" />
        </div>
      </div>
    )
  }

  if (pageError) {
    return (
      <div className="card max-w-xl mx-auto">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
          {pageError}
        </div>
      </div>
    )
  }

  if (!a) {
    return (
      <div className="card text-center">
        Subasta no encontrada
      </div>
    )
  }

  const rawImg =
    a?.product?.animal?.photo_url ||
    a?.image_url ||
    a?.photo_url

  const img = assetUrl(rawImg) || PLACEHOLDER_IMG

  const current = Number(a.current_price)

  const minNext =
    current > 0
      ? current + 1
      : Number(a.starting_price || 20)

  const finished = a.status === 'finished'

  return (
    <>
      {toast.show && (
        <div
          className={`fixed right-4 top-4 z-50 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-2xl ${
            toast.type === 'success'
              ? 'bg-emerald-600'
              : toast.type === 'warning'
              ? 'bg-orange-500'
              : toast.type === 'error'
              ? 'bg-red-600'
              : 'bg-slate-900'
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-200">
            <img
              src={img}
              className="h-[520px] w-full object-cover"
              alt={a.title || 'Subasta Pawction'}
              onError={ev => {
                ev.currentTarget.src = PLACEHOLDER_IMG
              }}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {a.document_url && (
              <a
                href={assetUrl(a.document_url)}
                target="_blank"
                rel="noreferrer"
                className="card card-hover flex items-center justify-between"
              >
                <div>
                  <div className="text-lg font-bold text-slate-900">
                    PDF del animal
                  </div>

                  <div className="mt-1 text-sm text-slate-500">
                    Información completa del pack
                  </div>
                </div>

                <div className="text-3xl">
                  📄
                </div>
              </a>
            )}

            {a.qr_url && (
              <a
                href={assetUrl(a.qr_url)}
                target="_blank"
                rel="noreferrer"
                className="card card-hover flex items-center justify-between"
              >
                <div>
                  <div className="text-lg font-bold text-slate-900">
                    Código QR
                  </div>

                  <div className="mt-1 text-sm text-slate-500">
                    Escanea para abrir el PDF
                  </div>
                </div>

                <div className="text-3xl">
                  🔳
                </div>
              </a>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="card">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`badge ${
                  finished
                    ? 'badge-red'
                    : 'badge-green'
                }`}
              >
                {finished
                  ? 'Subasta finalizada'
                  : 'Subasta activa'}
              </span>

              {!finished && (
                <span className="badge badge-orange">
                  ⏳ {timeLeft}
                </span>
              )}
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-900">
              {a.title}
            </h1>

            {a.description && (
              <p className="mt-5 text-base leading-7 text-slate-600">
                {a.description}
              </p>
            )}

            <div className="mt-8 rounded-[2rem] bg-slate-50 p-6">
              <div className="text-sm font-medium text-slate-500">
                Precio actual
              </div>

              <div className="mt-2 text-5xl font-black tracking-tight text-slate-950">
                {current > 0
                  ? current
                  : a.starting_price || 20}
                €
              </div>

              <div className="mt-3 text-sm text-slate-500">
                Puja mínima:{' '}
                <b className="text-slate-700">
                  {minNext} €
                </b>
              </div>
            </div>

            {!finished ? (
              <form
                onSubmit={submitBid}
                className="mt-6 space-y-4"
                noValidate
              >
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Introduce tu puja
                  </label>

                  <input
                    className="input text-lg"
                    type="text"
                    inputMode="numeric"
                    placeholder={`Mínimo ${minNext} €`}
                    value={amount}
                    onChange={e =>
                      setAmount(e.target.value)
                    }
                  />
                </div>

                <button
                  className="btn w-full py-3 text-base"
                  disabled={bidLoading}
                >
                  {bidLoading
                    ? 'Procesando puja...'
                    : 'Realizar puja'}
                </button>
              </form>
            ) : (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
                Esta subasta ya ha terminado.
              </div>
            )}

            <button
              onClick={toggleFav}
              className={`mt-4 w-full rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                fav
                  ? 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {fav
                ? '❤️ Quitar de favoritos'
                : '🤍 Añadir a favoritos'}
            </button>
          </div>

          <div className="card">
            <h2 className="text-lg font-bold text-slate-900">
              Impacto solidario
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-500">
              El 50% del importe recaudado se destina a
              iniciativas medioambientales y el otro 50%
              ayuda al mantenimiento y crecimiento de
              Pawction.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}