import { Auth } from './auth.js'
const API = import.meta.env.VITE_API_URL || 'https://pawction-backend.onrender.com/api'

export async function api(path, opts = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(opts.headers || {})
  }
  const token = Auth.token()
  if (token) headers['Authorization'] = 'Bearer ' + token

  const res = await fetch(API + path, { ...opts, headers, mode: 'cors' })
  if (!res.ok) {
    let txt = await res.text()
    try { const j = JSON.parse(txt); txt = j.message || JSON.stringify(j) } catch {}
    throw new Error(txt)
  }
  if (res.status === 204) return {}
  return res.json()
}

export const AuthAPI = {
  register: (data) => api('/auth/register', { method:'POST', body: JSON.stringify(data) }),
  login:    (data) => api('/auth/login',    { method:'POST', body: JSON.stringify(data) }),
  logout:         () => api('/auth/logout', { method:'POST' }),
  me:             () => api('/me'),
}

export const AuctionsAPI = {
  list: ()   => api('/auctions'),
  get:  (id) => api(`/auctions/${id}`),
}

export const FavoritesAPI = {
  toggle: (auctionId) => api(`/favorites/${auctionId}`, { method:'POST' })
}

export const PaymentAPI = {
  checkout: (id) => api(`/checkout/${id}`, { method:'POST' })
}

// --- Admin ---
export const AdminAPI = {
  auctions: {
    list:   () => api('/auctions'),
    create: (data) => api('/admin/auctions', { method:'POST', body: JSON.stringify(data) }),
    remove: (id)   => api(`/admin/auctions/${id}`, { method:'DELETE' }),
  }
}
