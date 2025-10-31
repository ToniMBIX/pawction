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
    const text = await res.text()
    try { throw new Error(JSON.parse(text).message || text) }
    catch { throw new Error(text) }
  }
  return res.status === 204 ? {} : res.json()
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
  bid:  (auction_id, amount) =>
          api('/bids', { method:'POST', body: JSON.stringify({ auction_id, amount }) }),
}

export const FavoritesAPI = {
  toggle: (auctionId) => api(`/favorites/${auctionId}`, { method:'POST' }),
  list:   () => api('/favorites'),
}
