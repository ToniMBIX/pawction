const KEY = 'pawction_token'
const USER_KEY = 'pawction_user'

export const Auth = {
  token(){ return localStorage.getItem(KEY) || null },
  setToken(t){ localStorage.setItem(KEY, t) },
  clear(){
    localStorage.removeItem(KEY)
    localStorage.removeItem(USER_KEY)
  },
  setUser(u){ localStorage.setItem(USER_KEY, JSON.stringify(u)) },
  user(){
    try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null') }
    catch { return null }
  },
  isLogged(){ return !!Auth.token() }
}
