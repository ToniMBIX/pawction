// frontend/src/lib/api.js
import { Auth } from './auth.js'

// =======================================================
//   CONFIGURACIÓN DE URLS
// =======================================================

// URL base del backend incluyendo /api
const RAW_API =
  import.meta.env.VITE_API_URL ||
  'https://pawction-backend.onrender.com/api'

export const API = RAW_API

// URL del backend SIN /api → sirve para /storage/...
export const BACKEND_URL = RAW_API.replace(/\/api\/?$/, '')


// =======================================================
//   HELPER assetUrl()
//   Normaliza URLs de imágenes del backend
// =======================================================

export function assetUrl(path) {
  if (!path) return null
  // ya es absoluta
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  // empieza por / -> lo colgamos del backend
  if (path.startsWith('/')) return `${BACKEND_URL}${path}`
  // cualquier otra cosa -> backend + /
  return `${BACKEND_URL}/${path}`
}

export const PLACEHOLDER_IMG = 'https://placehold.co/600x400?text=Pawction'

// =======================================================
//   FETCH helper (API genérica JSON + FormData)
// =======================================================

export async function api(path, opts = {}) {
  const isFormData = opts.body instanceof FormData

  const headers = {
    Accept: 'application/json',
    ...(opts.headers || {})
  }

  // ⚠️ SOLO poner Content-Type JSON si NO es FormData
  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  const token = Auth.token()
  if (token) headers['Authorization'] = 'Bearer ' + token

  const res = await fetch(API + path, {
    ...opts,
    headers,
    mode: 'cors'
  })

  if (!res.ok) {
    let msg = await res.text()
    try {
      const parsed = JSON.parse(msg)
      msg = parsed.message || JSON.stringify(parsed)
    } catch {}
    throw new Error(msg || `HTTP ${res.status}`)
  }

  if (res.status === 204) return {}
  return res.json()
}



// =======================================================
//   AUTH API
// =======================================================

export const AuthAPI = {
  register: (data) =>
    api('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  login: (data) =>
    api('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  logout: () => api('/auth/logout', { method: 'POST' }),

  me: () => api('/me'),
}



// =======================================================
//   AUCTIONS API
// =======================================================

export const AuctionsAPI = {
  list: () => api('/auctions'),
  get: (id) => api(`/auctions/${id}`),
  bid: (auction_id, amount) =>
    api('/bids', {
      method: 'POST',
      body: JSON.stringify({ auction_id, amount })
    }),
}



// =======================================================
//   FAVORITES API
// =======================================================

export const FavoritesAPI = {
  list: () => api('/favorites'),
  toggle: (auctionId) =>
    api(`/favorites/${auctionId}`, { method: 'POST' }),
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
  startFake: (auction_id) =>
    api(`/payment/fake-start?auction_id=${auction_id}`, { method: "GET" }),

  completeFake: (auction_id) =>
    api(`/payment/fake-complete`, {
      method: "POST",
      body: JSON.stringify({ auction_id }),
    }),
};


export const ShippingAPI = {
  // Guarda los datos de envío
  submit: (data) =>
    api("/shipping/submit", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Obtiene subastas pendientes del usuario
  listPending: () => api("/pending-orders"),
};






// =======================================================
//   ADMIN API
// =======================================================

export const AdminAPI = {
  auctions: {
    list: () => api('/admin/auctions'),

    create: (formData) =>
      api('/admin/auctions', {
        method: 'POST',
        body: formData
      }),

    remove: (id) =>
      api(`/admin/auctions/${id}`, {
        method: 'DELETE'
      }),

    // 👉 NUEVO ENDPOINT PARA CERRAR SUBASTA
    close: (id) =>
      api(`/admin/auctions/${id}/close`, {
        method: "POST"
      }),
      uploadQr: (id, data) => request("POST", `/admin/auctions/${id}/qr`, data),

  }
};
