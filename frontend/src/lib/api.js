import { Auth } from './auth.js'
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export async function api(path, opts={}){
  const headers = { 'Content-Type':'application/json', ...(opts.headers||{}) }
  const token = Auth.token()
  if(token) headers['Authorization'] = 'Bearer ' + token
  const res = await fetch(API + path, { headers, ...opts })
  if(!res.ok){
    let txt = await res.text()
    try { const j = JSON.parse(txt); txt = j.message || JSON.stringify(j) } catch {}
    throw new Error(txt)
  }
  return res.json()
}

export const AuthAPI = {
  register: (data) => api('/auth/register', { method:'POST', body: JSON.stringify(data) }),
  login: (data) => api('/auth/login', { method:'POST', body: JSON.stringify(data) }),
  logout: () => api('/auth/logout', { method:'POST' }),
  me: () => api('/me')
}

export const AuctionsAPI = {
  list: () => api('/auctions'),
  get: (id) => api(`/auctions/${id}`),
  bid: (auction_id, amount) => api('/bids', { method:'POST', body: JSON.stringify({ auction_id, amount }) })
}

export const FavoritesAPI = {
  toggle: (auctionId) => api(`/favorites/${auctionId}`, { method:'POST' })
}

export const PaymentAPI = {
  checkout: (id) => api(`/checkout/${id}`, { method:'POST' })
}
