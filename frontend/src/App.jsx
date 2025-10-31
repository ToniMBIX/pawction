import React from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import {Home} from './pages/Home.jsx'
import {Auctions} from './pages/Auctions.jsx'
import {AuctionDetail} from './pages/AuctionDetail.jsx'
import {Favorites} from './pages/Favorites.jsx'
import {Profile} from './pages/Profile.jsx'
import {Checkout} from './pages/Checkout.jsx'
import {Login} from './pages/Login.jsx'
import {Register} from './pages/Register.jsx'
import {AdminAuctions} from './pages/AdminAuctions.jsx'
import { Auth } from './lib/auth.js'
import { AuthAPI } from './lib/api.js'
console.log({
  Home, Auctions, AuctionDetail, Favorites, Profile,
  Checkout, Login, Register, AdminAuctions
})

function ErrorBoundary({ children }) {
  const [err, setErr] = React.useState(null)
  return err ? (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-2">Error en la UI</h2>
      <pre className="text-sm p-3 bg-red-50 border rounded whitespace-pre-wrap">
        {String(err.stack || err.message || err)}
      </pre>
    </div>
  ) : (
    <React.ErrorBoundary fallbackRender={({ error }) => setErr(error) || null}>
      {children}
    </React.ErrorBoundary>
  )
}

function UserMenu(){
  const nav = useNavigate()
  const [isLogged, setIsLogged] = React.useState(Auth.isLogged())
  const [isAdmin,  setIsAdmin]  = React.useState(Auth.isAdmin())

  React.useEffect(()=>{
    const int = setInterval(()=> {
      setIsLogged(Auth.isLogged())
      setIsAdmin(Auth.isAdmin())
    }, 500)
    return ()=>clearInterval(int)
  },[])

  return (
    <div className="ml-auto flex items-center gap-3">
      {isLogged ? (
        <>
          {isAdmin && <Link to="/admin/auctions">Admin</Link>}
          <Link to="/profile">Perfil</Link>
          <button className="text-sm underline" onClick={async()=>{
            try{ await AuthAPI.logout() }catch{}
            Auth.clear(); nav('/')
          }}>Salir</button>
        </>
      ) : (
        <>
          <Link to="/login">Entrar</Link>
          <Link to="/register">Registro</Link>
        </>
      )}
      <div className="text-xs opacity-60 hidden sm:block">build {__APP_BUILD_TIME__}</div>
    </div>
  )
}

export default function App(){
  return (
    <ErrorBoundary>
      <div>
        <header className="border-b">
          <div className="container flex items-center gap-6 py-4">
            <Link to="/" className="text-2xl font-extrabold">Pawction</Link>
            <nav className="flex gap-4 text-sm">
              <Link to="/auctions">Subastas</Link>
              <Link to="/favorites">Favoritos</Link>
            </nav>
            <UserMenu />
          </div>
        </header>

        <main className="container py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auctions" element={<Auctions />} />
            <Route path="/auctions/:id" element={<AuctionDetail />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/checkout/:id" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/auctions" element={<AdminAuctions />} />
          </Routes>
        </main>

        <footer className="border-t">
          <div className="container py-6 text-sm opacity-70">
            © {new Date().getFullYear()} Pawction — 50/50 Pawction / Greenpeace
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  )
}
