import React from 'react'
import { useParams } from 'react-router-dom'
import { AuctionsAPI, FavoritesAPI, assetUrl } from '../lib/api.js'
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
      const data = await AuctionsAPI.get(id)

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
      <div className="text-center py-10 opacity-70">
        Cargando subasta...
      </div>
    )
  }

  if (pageError) {
    return (
      <div className="card max-w-xl mx-auto">
        <div className="rounded-xl border border-red-500 bg-red-50 px-4 py-3 text-red-700">
          {pageError}
        </div>
      </div>
    )
  }

  if (!a) {
    return (
      <div className="text-center py-10">
        Subasta no encontrada
      </div>
    )
  }

  const rawImg =
    a?.product?.animal?.photo_url ||
    a?.image_url ||
    a?.photo_url

  const img = assetUrl(rawImg) || '/placeholder.jpg'

  const current = Number(a.current_price)

  const minNext =
    current > 0
      ? current + 1
      : Number(a.starting_price || 20)

  const finished = a.status === 'finished'

  return (
    <>
      {/* TOAST */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded shadow text-white
            ${
              toast.type === 'success'
                ? 'bg-green-600'
                : toast.type === 'warning'
                ? 'bg-yellow-600'
                : toast.type === 'error'
                ? 'bg-red-600'
                : 'bg-gray-700'
            }
          `}
        >
          {toast.msg}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <img
            src={img}
            className="w-full max-h-[420px] object-cover rounded-xl"
            alt={a.title || 'Subasta'}
            onError={(ev) => {
              ev.currentTarget.src = '/placeholder.jpg'
            }}
          />
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-bold">
            {a.title}
          </h1>

          {a.description && (
            <p className="opacity-80">
              {a.description}
            </p>
          )}

          <div>
            Precio actual:{' '}
            <b>
              {current > 0
                ? current
                : a.starting_price || 20}{' '}
              €
            </b>
          </div>

          <div className="text-sm opacity-70">
            Termina en: <b>{timeLeft}</b>
          </div>

          {!finished ? (
            <form
              onSubmit={submitBid}
              className="flex gap-2"
              noValidate
            >
              <input
                className="input"
                type="text"
                inputMode="numeric"
                placeholder={`Mínimo ${minNext}€`}
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
              />

              <button
                className="btn"
                disabled={bidLoading}
              >
                {bidLoading
                  ? 'Pujando...'
                  : 'Pujar'}
              </button>
            </form>
          ) : (
            <div className="text-red-600 font-semibold">
              Esta subasta ya ha terminado.
            </div>
          )}

          <button
            onClick={toggleFav}
            className="btn"
          >
            {fav
              ? 'Quitar de favoritos'
              : 'Agregar a favoritos'}
          </button>

          <div className="space-y-2 mt-4">
            {a.document_url && (
              <a
                href={assetUrl(a.document_url)}
                target="_blank"
                rel="noreferrer"
                className="btn bg-blue-600 text-white w-full text-center"
              >
                Ver PDF
              </a>
            )}

            {a.qr_url && (
              <a
                href={assetUrl(a.qr_url)}
                target="_blank"
                rel="noreferrer"
                className="btn bg-green-600 text-white w-full text-center"
              >
                Ver QR
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  )
}