import { Auth } from './auth.js'

const API = import.meta.env.VITE_API_URL || 'https://pawction-backend.onrender.com/api'

export async function api(path, opts = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json', // <-- MUY IMPORTANTE para evitar redirects
    ...(opts.headers || {})
  }

  const token = Auth.token()
  if (token) headers['Authorization'] = 'Bearer ' + token

  // ⚠️ Nunca incluyas credentials: 'include'
  const res = await fetch(API + path, {
    ...opts,
    headers,
    mode: 'cors', // explícito pero seguro
  })

  if (!res.ok) {
    let txt = await res.text()
    try {
      const j = JSON.parse(txt)
      txt = j.message || JSON.stringify(j)
    } catch {}
    throw new Error(txt)
  }

  // Si la respuesta es 204 (sin contenido), evita .json() vacío
  if (res.status === 204) return {}
  return res.json()
}

// ==== API modules ====
export const AuthAPI = {
  register: (data) => api('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  login: (data) => api('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  logout: () => api('/auth/logout', { method: 'POST' }),
  me: () => api('/me')
}

export const AuctionsAPI = {
  list: () => api('/auctions'),
  get: (id) => api(`/auctions/${id}`),
  bid: (auction_id, amount) => api('/bids', {
    method: 'POST',
    body: JSON.stringify({ auction_id, amount })
  })
}

export const FavoritesAPI = {
  toggle: (auctionId) => api(`/favorites/${auctionId}`, { method: 'POST' })
}

export const PaymentAPI = {
  checkout: (id) => api(`/checkout/${id}`, { method: 'POST' })
}
// --- Admin ---
export const AdminAPI = {
  // GET /api/admin/auctions
  list: () => api('/admin/auctions'),

  // POST /api/admin/auctions
  // payload: { title, description?, image_url?, starting_price? }
  create: (payload) =>
    api('/admin/auctions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // DELETE /api/admin/auctions/:id
  remove: (id) =>
    api(`/admin/auctions/${id}`, {
      method: 'DELETE',
    }),

  // (Opcional) PUT /api/admin/auctions/:id
  update: (id, payload) =>
    api(`/admin/auctions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
}
