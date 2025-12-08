// frontend/src/pages/Profile.jsx
import React from 'react'
import { AuthAPI } from '../lib/api.js'
import { Auth } from '../lib/auth.js'

export default function Profile() {
  const [user, setUser] = React.useState(null)
  const [password, setPassword] = React.useState('')
  const [password2, setPassword2] = React.useState('')
  const [saving, setSaving] = React.useState(false)
  const [msg, setMsg] = React.useState('')

  React.useEffect(() => {
    AuthAPI.me()
      .then(data => setUser(data))
      .catch(() => setUser(null))
  }, [])

  async function submit(e) {
  e.preventDefault();
  setMsg(""); // msg general
  let errors = [];

  // -------- VALIDACIONES --------
  const data = {
    name: user.name,
    email: user.email,
  };

  // Si quieren cambiar contraseña
  if (password.trim() || password2.trim()) {
    if (!password.trim() || !password2.trim()) {
      errors.push("Debes escribir ambas contraseñas.");
    } else if (password !== password2) {
      errors.push("Las contraseñas no coinciden.");
    } else {
      data.password = password;
      data.password_confirmation = password2;
    }
  }

  if (errors.length > 0) {
    setMsg(errors.join(" "));
    return;
  }

  setSaving(true);

  // -------- PETICIÓN --------
  try {
    await AuthAPI.update(data);

    let successMsg = "Datos actualizados correctamente.";

    if (data.password) {
      successMsg += " Contraseña cambiada.";
      setPassword("");
      setPassword2("");
    }

    setMsg(successMsg);
  } catch (err) {
    setMsg(err.message || "Error al guardar los datos.");
  }

  setSaving(false);
}


  if (!user) {
    return (
      <div className="text-center text-sm opacity-80 py-10">
        Cargando perfil…
      </div>
    )
  }

  return (
    <div className="flex justify-center mt-10 px-4">
      <div className="bg-[#111827] border border-gray-700 shadow-xl rounded-2xl p-8 w-full max-w-xl">
        
        <h1 className="text-3xl font-bold text-white mb-6">
          Mi perfil
        </h1>

        {/* Datos del usuario */}
        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-sm opacity-70 mb-1">Nombre</label>
            <input
  className="input bg-gray-900 text-white border border-gray-700"
  value={user.name}
  onChange={e => setUser({ ...user, name: e.target.value })}
/>

          </div>

          <div>
            <label className="block text-sm opacity-70 mb-1">Correo electrónico</label>
            <input
  className="input bg-gray-900 text-white border border-gray-700"
  value={user.email}
  onChange={e => setUser({ ...user, email: e.target.value })}
/>

          </div>
        </div>

        {/* Form contraseña */}
        <form onSubmit={submit} className="space-y-4">
          <h2 className="text-xl font-semibold text-white mb-3">
            Cambiar contraseña
          </h2>

          <div>
          <input
            type="password"
            className="input bg-gray-900 text-white border border-gray-700"
            placeholder="Nueva contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          </div>

          <div>
          <input
            type="password"
            className="input bg-gray-900 text-white border border-gray-700"
            placeholder="Confirmar contraseña"
            value={password2}
            onChange={e => setPassword2(e.target.value)}
          />
          </div>
          
          {msg && (
            <div className="text-sm text-center text-purple-400 mt-2">
              {msg}
            </div>
          )}

          <button
            className="btn w-full mt-3"
            disabled={saving}
          >
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  )
}
