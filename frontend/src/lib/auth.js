const KEY_TOKEN = 'auth_token'
const KEY_USER  = 'auth_user'

export const Auth = {
  token(){ return localStorage.getItem(KEY_TOKEN) || '' },
  setToken(t){ if (t) localStorage.setItem(KEY_TOKEN, t) },
  clearToken(){ localStorage.removeItem(KEY_TOKEN) },

  user(){
    try { return JSON.parse(localStorage.getItem(KEY_USER) || 'null') } catch { return null }
  },
  setUser(u){ localStorage.setItem(KEY_USER, JSON.stringify(u || null)) },
  clearUser(){ localStorage.removeItem(KEY_USER) },

  clear(){ this.clearToken(); this.clearUser() },

  isLogged(){ return !!this.token() },
  isAdmin(){
    const u = this.user()
    return !!(u && (u.is_admin === 1 || u.is_admin === true))
  }
}
