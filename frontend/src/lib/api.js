import { Auth } from './auth.js'
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

async function handle(res) {
  if (!res.ok) {
    let txt = await res.text()
    try { const j = JSON.parse(txt); txt = j.message || JSON.stringify(j) } catch {}
    throw new Error(txt || ('HTTP ' + res.status))
  }
  const ct = res.headers.get('content-type') || ''
  return ct.includes('application/json') ? res.json() : res.text()
}

export async function api(path, opts = {}) {
  const headers = {
    'Accept': 'application/json',
    ...(opts.body && !(opts.headers && opts.headers['Content-Type']) ? {'Content-Type':'application/json'} : {}),
    ...(opts.headers || {})
  }
  const token = Auth.token()
  if (token) headers['Authorization'] = 'Bearer ' + token

  const res = await fetch(API + path, { ...opts, headers, mode:'cors', credentials:'omit' })
  return handle(res)
}

export const AuthAPI = {
  register: (data) => api('/auth/register', { method:'POST', body: JSON.stringify(data) }),
  login:    (data) => api('/auth/login',    { method:'POST', body: JSON.stringify(data) }),
  me:       ()      => api('/me'),
}

export const AuctionsAPI = {
  list: (page=1) => api(`/auctions?page=${page}`),
  get:  (id)    => api(`/auctions/${id}`),
}

export const BidsAPI = {
  create: (auctionId, amount) => api(`/auctions/${auctionId}/bids`, {
    method: 'POST',
    body: JSON.stringify({ amount })
  })
}

export const FavoritesAPI = {
  toggle: (auctionId) => api(`/auctions/${auctionId}/favorite`, { method:'POST' }),
}

export const PaymentAPI = {
  checkout: (auctionId) => api(`/checkout/${auctionId}`, { method:'POST' }),
}
