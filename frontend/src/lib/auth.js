const KEY_TOKEN = "auth_token";
const KEY_USER  = "auth_user";

export const Auth = {

  // --- ESTADO EN MEMORIA ---
  userData: null,

  // --- TOKEN ---
  setToken(t) {
    localStorage.setItem(KEY_TOKEN, t);
  },

  token() {
    return localStorage.getItem(KEY_TOKEN);
  },

  // --- USUARIO ---
  setUser(u) {
    this.userData = u;
    localStorage.setItem(KEY_USER, JSON.stringify(u || null));
    window.dispatchEvent(new Event("auth-updated"));
  },

  user() {
    if (this.userData) return this.userData;

    try {
      const raw = localStorage.getItem(KEY_USER);
      this.userData = raw ? JSON.parse(raw) : null;
    } catch {
      this.userData = null;
    }
    return this.userData;
  },

  // --- LIMPIAR TODO ---
  clear() {
    localStorage.removeItem(KEY_TOKEN);
    localStorage.removeItem(KEY_USER);
    this.userData = null;
    window.dispatchEvent(new Event("auth-updated"));
  },

  // --- ESTADO LOGIN ---
  isLogged() {
    return !!this.token();
  },

  isAdmin() {
    const u = this.user();
    return !!(u && (u.is_admin === true || u.is_admin == 1));
  },

  // --- ACTUALIZAR DATOS DEL USUARIO ---
  updateUser(user) {
    if (!user) return;

    this.userData = user;
    localStorage.setItem(KEY_USER, JSON.stringify(user));

    // 🔥 Notificar a TODOS los componentes
    window.dispatchEvent(new Event("auth-updated"));
  },
};
