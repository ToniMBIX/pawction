const KEY_TOKEN = 'auth_token'
const KEY_USER  = 'auth_user'

export const Auth = {
  setToken(t){ localStorage.setItem(KEY_TOKEN, t) },
  token(){ return localStorage.getItem(KEY_TOKEN) },
  setUser(u){ localStorage.setItem(KEY_USER, JSON.stringify(u || null)) },
  user(){
    try { return JSON.parse(localStorage.getItem(KEY_USER) || 'null') } catch { return null }
  },
  clear(){
    localStorage.removeItem(KEY_TOKEN)
    localStorage.removeItem(KEY_USER)
  },
  isLogged(){ return !!Auth.token() },
  isAdmin(){
    const u = Auth.user()
    return !!(u && (u.is_admin === true || u.is_admin === 1 || u.is_admin === '1'))
  },
  updateUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
  window.dispatchEvent(new Event("auth-updated"));
}

}
