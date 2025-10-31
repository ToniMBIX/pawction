// frontend/src/lib/auth.js
const KEY_TOKEN = 'auth_token'
const KEY_USER  = 'auth_user'

export const Auth = {
  setToken(t) { localStorage.setItem(KEY_TOKEN, t) },
  token()     { return localStorage.getItem(KEY_TOKEN) },
  clear()     { localStorage.removeItem(KEY_TOKEN); localStorage.removeItem(KEY_USER) },

  setUser(u)  { localStorage.setItem(KEY_USER, JSON.stringify(u || {})) },
  user() {
    try { return JSON.parse(localStorage.getItem(KEY_USER) || 'null') }
    catch { return null }
  },

  isLogged()  { return !!Auth.token() },

  // 👉 usado por tu UI/admin
  isAdmin() {
    const u = Auth.user()
    return !!(u && (u.is_admin === 1 || u?.is_admin === true || u?.role === 'admin'))
  }
}
