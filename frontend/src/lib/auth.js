const KEY_TOKEN = 'auth_token'
const KEY_USER  = 'auth_user'

export const Auth = {
  token() {
    return localStorage.getItem(KEY_TOKEN)
  },
  setToken(t) {
    if (t) localStorage.setItem(KEY_TOKEN, t)
    else localStorage.removeItem(KEY_TOKEN)
  },
  clear() {
    localStorage.removeItem(KEY_TOKEN)
    localStorage.removeItem(KEY_USER)
  },
  isLogged() {
    return !!Auth.token()
  },
  user() {
    try { return JSON.parse(localStorage.getItem(KEY_USER) || 'null') }
    catch { return null }
  },
  setUser(u) {
    if (u) localStorage.setItem(KEY_USER, JSON.stringify(u))
    else localStorage.removeItem(KEY_USER)
  },
  isAdmin() {
    return !!(Auth.user()?.is_admin)
  }
}
