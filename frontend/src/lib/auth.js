const KEY = 'pawction_token'

export const Auth = {
  token: () => localStorage.getItem(KEY),
  setToken: (t) => localStorage.setItem(KEY, t),
  clear: () => localStorage.removeItem(KEY),
  isLogged: () => !!localStorage.getItem(KEY),
}
