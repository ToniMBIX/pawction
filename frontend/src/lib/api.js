import { Auth } from './auth.js'

// =======================================================
//   CONFIGURACIÓN DE URLS
// =======================================================

const RAW_API =
  import.meta.env.VITE_API_URL ||
  'https://pawction-backend.onrender.com/api'

export const API = RAW_API

export const BACKEND_URL = RAW_API.replace(/\/api\/?$/, '')

// =======================================================
//   HELPERS
// =======================================================

export function assetUrl(path) {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/')) return `${BACKEND_URL}${path}`
  return `${BACKEND_URL}/${path}`
}

export const PLACEHOLDER_IMG = 'https://placehold.co/600x400?text=Pawction'

export function firstError(err, fallback = 'Ha ocurrido un error') {
  if (!err) return fallback

  if (err.errors) {
    const firstField = Object.keys(err.errors)[0]

    if (
      firstField &&
      Array.isArray(err.errors[firstField]) &&
      err.errors[firstField][0]
    ) {
      return err.errors[firstField][0]
    }
  }

  return err.message || fallback
}

// =======================================================
//   FETCH helper
// =======================================================

export async function api(path, opts = {}) {
  const isFormData = opts.body instanceof FormData

  const headers = {
    Accept: 'application/json',
    ...(opts.headers || {}),
  }

  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  const token = Auth.token()

  if (token) {
    headers.Authorization = 'Bearer ' + token
  }

  let res

  try {
    res = await fetch(API + path, {
      ...opts,
      headers,
      mode: 'cors',
    })
  } catch {
    const error = new Error('No se pudo conectar con el servidor')
    error.status = 0
    throw error
  }

  if (res.status === 401) {
    try {
      Auth.clear()
    } catch {}

    if (
      window.location.pathname !== '/login' &&
      window.location.pathname !== '/register'
    ) {
      window.location.href = '/login'
    }

    const error = new Error('Tu sesión ha expirado')
    error.status = 401
    throw error
  }

  if (!res.ok) {
    let payload = null
    let raw = ''

    try {
      raw = await res.text()
    } catch {}

    try {
      payload = JSON.parse(raw)
    } catch {}

    const error = new Error(
      payload?.message || payload?.error || `HTTP ${res.status}`
    )

    error.status = res.status
    error.errors = payload?.errors || {}
    error.payload = payload

    throw error
  }

  if (res.status === 204) return {}

  try {
    return await res.json()
  } catch {
    return {}
  }
}

// =======================================================
//   AUTH API
// =======================================================

export const AuthAPI = {
  register: data =>
    api('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: data =>
    api('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () => api('/auth/logout', { method: 'POST' }),

  me: () => api('/me'),

  summary: () => api('/me/summary'),

  participatingAuctions: () => api('/me/participating-auctions'),

  update: data =>
    api('/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}

// =======================================================
//   AUCTIONS API
// =======================================================

export const AuctionsAPI = {
  list: () => api('/auctions'),

  get: id => api(`/auctions/${id}`),

  bid: (auction_id, amount) =>
    api('/bids', {
      method: 'POST',
      body: JSON.stringify({ auction_id, amount }),
    }),
}

// =======================================================
//   FAVORITES API
// =======================================================

export const FavoritesAPI = {
  list: () => api('/favorites'),

  toggle: auctionId =>
    api(`/favorites/${auctionId}`, {
      method: 'POST',
    }),
}

// =======================================================
//   HISTORIAL DE PUJAS
// =======================================================

export const BidsAPI = {
  mine: () => api('/bids/mine'),
}

// =======================================================
//   PAGOS
// =======================================================

export const PaymentAPI = {
  startFake: auction_id =>
    api(`/payment/fake-start?auction_id=${auction_id}`, {
      method: 'GET',
    }),

  completeFake: auction_id =>
    api('/payment/fake-complete', {
      method: 'POST',
      body: JSON.stringify({ auction_id }),
    }),

    createStripeCheckout: auction_id =>
  api('/payment/stripe-checkout', {
    method: 'POST',
    body: JSON.stringify({ auction_id }),
  }),

confirmStripe: session_id =>
  api('/payment/stripe-confirm', {
    method: 'POST',
    body: JSON.stringify({ session_id }),
  }),
}

// =======================================================
//   ENVÍOS
// =======================================================

export const ShippingAPI = {
  submit: data =>
    api('/shipping/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  listPending: () => api('/pending-orders'),
}

// =======================================================
//   ADMIN API
// =======================================================

export const AdminAPI = {
  auctions: {
    list: () => api('/admin/auctions'),

    create: formData =>
      api('/admin/auctions', {
        method: 'POST',
        body: formData,
      }),

    remove: id =>
      api(`/admin/auctions/${id}`, {
        method: 'DELETE',
      }),

    close: id =>
      api(`/admin/auctions/${id}/close`, {
        method: 'POST',
      }),

    uploadQr: (id, formData) =>
      api(`/admin/auctions/${id}/qr`, {
        method: 'POST',
        body: formData,
      }),
  },
}