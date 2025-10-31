// frontend/src/lib/api.js
import { Auth } from './auth.js'

const API = import.meta.env.VITE_API_URL || 'https://pawction-backend.onrender.com/api'

// Helper de fetch con JSON y token
export async function api(path, opts = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(opts.headers || {})
  }
  const token = Auth.token()
  if (token) headers['Authorization'] = 'Bearer ' + token

  const res = await fetch(API + path, {
    ...opts,
    headers,
    mode: 'cors', // explícito
    // NO credentials: 'include'
  })

  if (!res.ok) {
    let msg = await res.text()
    try { const j = JSON.parse(msg); msg = j.message || JSON.stringify(j) } catch {}
    throw new Error(msg || `HTTP ${res.status}`)
  }

  if (res.status === 204) return {}
  return res.json()
}

// ==== APIs públicas / protegidas ====

export const AuthAPI = {
  register: (data) => api('/auth/register', { method:'POST', body: JSON.stringify(data) }),
  login:    (data) => api('/auth/login',    { method:'POST', body: JSON.stringify(data) }),
  logout:   ()     => api('/auth/logout',   { method:'POST' }),
  me:              () => api('/me'),
}

export const AuctionsAPI = {
  list: ()      => api('/auctions'),
  get:  (id)    => api(`/auctions/${id}`),
  bid:  (auction_id, amount) =>
    api('/bids', { method:'POST', body: JSON.stringify({ auction_id, amount }) }),
}

export const FavoritesAPI = {
  toggle: (auctionId) => api(`/favorites/${auctionId}`, { method:'POST' }),
  mine:   async () => {
    const me = await AuthAPI.me()
    return me?.favorites || []
  }
}


export const PaymentAPI = {
  checkout: (auctionId) => api(`/checkout/${auctionId}`, { method:'POST' }),
}

// Opcional: endpoints de administración si ya los expusiste en backend
export const AdminAPI = {
  auctions: {
    list:   () => api('/admin/auctions'),
    create: (payload) => api('/admin/auctions', { method:'POST', body: JSON.stringify(payload) }),
    remove: (id) => api(`/admin/auctions/${id}`, { method:'DELETE' }),
  },
}
