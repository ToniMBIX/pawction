// App.jsx
import React from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Auctions from './pages/Auctions.jsx'
import AuctionDetail from './pages/AuctionDetail.jsx'
import Favorites from './pages/Favorites.jsx'
import BidsHistory from './pages/BidsHistory.jsx'
import Profile from './pages/Profile.jsx'
import Checkout from './pages/Checkout.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import AdminAuctions from './pages/AdminAuctions.jsx'
import FakePayment from "./pages/FakePayment.jsx";
import PendingOrders from "./pages/PendingOrders.jsx";
import ShippingForm from "./pages/ShippingForm.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";

import { Auth } from './lib/auth.js'
import { AuthAPI } from './lib/api.js'

import logo from '/logo.png'

function UserMenu() {
  const nav = useNavigate()
  const [user, setUser] = React.useState(Auth.user())
  const [isLogged, setIsLogged] = React.useState(Auth.isLogged())

  React.useEffect(() => {
    function update() {
      setUser(Auth.user())
      setIsLogged(Auth.isLogged())
    }

    // 🔥 Escuchar cambios en el usuario
    window.addEventListener("auth-updated", update)

    return () => window.removeEventListener("auth-updated", update)
  }, [])

  return (
    <div className="ml-auto flex items-center gap-3">
      {isLogged ? (
        <>
          <span className="text-sm opacity-70">Hola, {user?.name || 'Usuario'}</span>
          <Link to="/profile">Perfil</Link>
          <button
            className="text-sm underline"
            onClick={async () => {
              try { await AuthAPI.logout() } catch {}
              Auth.clear()
              window.dispatchEvent(new Event("auth-updated"))
              nav('/')
            }}
          >
            Salir
          </button>
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

export default function App() {
  const [user, setUser] = React.useState(Auth.user())
  const [isLogged, setIsLogged] = React.useState(Auth.isLogged())
  const [isAdmin, setIsAdmin] = React.useState(Auth.isAdmin())
const [summary, setSummary] = React.useState({
  active_participating_count: 0,
  pending_won_count: 0,
})
  const [summary, setSummary] = React.useState({
  active_participating_count: 0,
  pending_won_count: 0,
})

  React.useEffect(() => {
    function update() {
      setUser(Auth.user())
      setIsLogged(Auth.isLogged())
      setIsAdmin(Auth.isAdmin())
      if (Auth.isLogged()) {
  AuthAPI.summary()
    .then(setSummary)
    .catch(() => setSummary({
      active_participating_count: 0,
      pending_won_count: 0,
    }))
} else {
  setSummary({
    active_participating_count: 0,
    pending_won_count: 0,
  })
}
    }

    // 🔥 Escuchar cambios globales de auth
    window.addEventListener("auth-updated", update)

    return () => window.removeEventListener("auth-updated", update)
  }, [])

  return (
    <div>
      <header className="border-b">
        <div className="container flex items-center gap-6 py-4">

          <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold">
            <img src={logo} alt="Pawction" className="w-8 h-8 rounded" />
            Pawction
          </Link>

<nav className="flex gap-4 text-sm">
  <Link to="/auctions" className="relative">
    Subastas

    {isLogged && summary.active_participating_count > 0 && (
      <span className="ml-1 rounded-full bg-red-600 px-2 py-0.5 text-xs text-white">
        {summary.active_participating_count}
      </span>
    )}
  </Link>

  <Link to="/favorites">Favoritos</Link>

  <Link to="/history">Historial</Link>

  <Link to="/pending-orders" className="relative">
    Pendientes

    {isLogged && summary.pending_won_count > 0 && (
      <span className="ml-1 rounded-full bg-red-600 px-2 py-0.5 text-xs text-white">
        {summary.pending_won_count}
      </span>
    )}
  </Link>

  {isAdmin && <Link to="/admin/auctions">Admin</Link>}
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
          <Route path="/admin/auctions" element={<AdminAuctions />} />
          <Route path="/pending-orders" element={<PendingOrders />} />
          <Route path="/shipping/:id" element={<ShippingForm />} />
          <Route path="/fake-payment/:id" element={<FakePayment />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
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
