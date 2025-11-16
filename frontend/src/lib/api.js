// frontend/src/lib/api.js
import { Auth } from './auth.js'

const API = import.meta.env.VITE_API_URL || 'https://pawction-backend.onrender.com/api'

// Helper de fetch con JSON y token
export async function api(path, opts = {}) {
  const isFormData = opts.body instanceof FormData

  const headers = {
    'Accept': 'application/json',
    ...(opts.headers || {})
  }

  // Solo ponemos Content-Type JSON si NO es FormData
  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  const token = Auth.token()
  if (token) headers['Authorization'] = 'Bearer ' + token

  const res = await fetch(API + path, {
    ...opts,
    headers,
    mode: 'cors',
  })

  if (!res.ok) {
    let msg = await res.text()
    try {
      const j = JSON.parse(msg)
      msg = j.message || JSON.stringify(j)
    } catch {}
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
  mine:   () => api('/me'),
}

export const PaymentAPI = {
  checkout: (auctionId) => api(`/checkout/${auctionId}`, { method:'POST' }),
}

export const AdminAPI = {
  auctions: {
    list:   () => api('/admin/auctions'),
    // MUY IMPORTANTE: aquí esperamos un FormData
    create: (formData) => api('/admin/auctions', {
      method: 'POST',
      body: formData,
    }),
    remove: (id) => api(`/admin/auctions/${id}`, { method:'DELETE' }),
  },
}
