const KEY_TOKEN = 'auth_token'
const KEY_USER  = 'auth_user'

export const Auth = {
  setToken(t) { localStorage.setItem('token', t) },
  token() { return localStorage.getItem('token') },
  clear() { localStorage.removeItem('token'); localStorage.removeItem('user') },

  setUser(u) { localStorage.setItem('user', JSON.stringify(u || {})) },
  user() { try { return JSON.parse(localStorage.getItem('user') || '{}') } catch { return {} } },
  isLogged() { return !!localStorage.getItem('token') },
  isAdmin() { return !!Auth.user()?.is_admin },
}

