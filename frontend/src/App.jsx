import React from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Auctions from './pages/Auctions.jsx'
import AuctionDetail from './pages/AuctionDetail.jsx'
import Favorites from './pages/Favorites.jsx'
import BidsHistory from './pages/BidsHistory.jsx'   // <— NUEVO
import Profile from './pages/Profile.jsx'
import Checkout from './pages/Checkout.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import { Auth } from './lib/auth.js'
import { AuthAPI } from './lib/api.js'

function UserMenu(){
  const nav = useNavigate()
  const [user, setUser] = React.useState(Auth.user())
  const [isLogged, setIsLogged] = React.useState(Auth.isLogged())

  React.useEffect(()=>{
    const int = setInterval(()=>{
      setUser(Auth.user())
      setIsLogged(Auth.isLogged())
    }, 1000)
    return ()=>clearInterval(int)
  },[])

  return (
    <div className="ml-auto flex items-center gap-3">
      {isLogged ? (
        <>
          <span className="text-sm opacity-70">Hola, {user?.name || 'Usuario'}</span>
          <Link to="/profile">Perfil</Link>
          <button className="text-sm underline" onClick={async()=>{
            try { await AuthAPI.logout() } catch {}
            Auth.clear(); nav('/')
          }}>Salir</button>
        </>
      ) : (
        <>
          <Link to="/login">Entrar</Link>
          <Link to="/register">Registro</Link>
        </>
      )}
    </div>
  )
}
function PrivateRoute({ children }) {
  if (!Auth.isLogged()) {
    window.location.href = '/login'
    return null
  }
  return children
}

export default function App(){
  return (
    <div>
      <header className="border-b">
        <div className="container flex items-center gap-6 py-4">
          <Link to="/" className="text-2xl font-extrabold">Pawction</Link>
          <nav className="flex gap-4 text-sm">
            <Link to="/auctions">Subastas</Link>
            <Link to="/favorites">Favoritos</Link>
            <Link to="/history">Historial</Link> {/* <— NUEVO */}
          </nav>
          <UserMenu />
        </div>
      </header>

      <main className="container py-6">
        <Routes>
  <Route path="/" element={<Home />} />
  <Route path="/auctions" element={<Auctions />} />
  <Route path="/auctions/:id" element={<AuctionDetail />} />
  <Route path="/favorites" element={<PrivateRoute><Favorites /></PrivateRoute>} />
  <Route path="/history" element={<PrivateRoute><BidsHistory /></PrivateRoute>} />
  <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
  <Route path="/checkout/:id" element={<PrivateRoute><Checkout /></PrivateRoute>} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
</Routes>

      </main>

      <footer className="border-t">
        <div className="container py-6 text-sm opacity-70">
          © {new Date().getFullYear()} Pawction — 50/50 Pawction / Greenpeace
        </div>
      </footer>
    </div>
  )
}
