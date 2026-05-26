import React from 'react'
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from 'react-router-dom'

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
import FakePayment from './pages/FakePayment.jsx'
import PendingOrders from './pages/PendingOrders.jsx'
import ShippingForm from './pages/ShippingForm.jsx'
import PaymentSuccess from './pages/PaymentSuccess.jsx'

import { Auth } from './lib/auth.js'
import { AuthAPI } from './lib/api.js'

import logo from '/logo.png'

function NavItem({ to, children, badge }) {
  const location = useLocation()

  const active =
    location.pathname === to ||
    location.pathname.startsWith(to + '/')

  return (
    <Link
      to={to}
      className={`relative flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-emerald-100 text-emerald-700'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {children}

      {badge > 0 && (
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
          {badge}
        </span>
      )}
    </Link>
  )
}

function UserMenu() {
  const nav = useNavigate()

  const [user, setUser] = React.useState(Auth.user())
  const [isLogged, setIsLogged] = React.useState(Auth.isLogged())

  React.useEffect(() => {
    function update() {
      setUser(Auth.user())
      setIsLogged(Auth.isLogged())
    }

    window.addEventListener('auth-updated', update)

    return () =>
      window.removeEventListener('auth-updated', update)
  }, [])

  if (!isLogged) {
    return (
      <div className="ml-auto flex items-center gap-3">
        <Link
          to="/login"
          className="btn-secondary"
        >
          Entrar
        </Link>

        <Link
          to="/register"
          className="btn"
        >
          Crear cuenta
        </Link>
      </div>
    )
  }

  return (
    <div className="ml-auto flex items-center gap-3">
      <Link
        to="/profile"
        className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm transition hover:shadow-md"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
          {(user?.name || 'U')[0]}
        </div>

        <div className="hidden sm:block">
          <div className="text-sm font-semibold text-slate-800">
            {user?.name || 'Usuario'}
          </div>

          <div className="text-xs text-slate-500">
            {user?.email}
          </div>
        </div>
      </Link>

      <button
        className="btn-secondary"
        onClick={async () => {
          try {
            await AuthAPI.logout()
          } catch {}

          Auth.clear()

          window.dispatchEvent(
            new Event('auth-updated')
          )

          nav('/')
        }}
      >
        Salir
      </button>
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
  const [isLogged, setIsLogged] = React.useState(
    Auth.isLogged()
  )

  const [isAdmin, setIsAdmin] = React.useState(
    Auth.isAdmin()
  )

  const [summary, setSummary] = React.useState({
    active_participating_count: 0,
    pending_won_count: 0,
  })

  React.useEffect(() => {
    function update() {
      setIsLogged(Auth.isLogged())
      setIsAdmin(Auth.isAdmin())

      if (Auth.isLogged()) {
        AuthAPI.summary()
          .then(r =>
            setSummary(r.data || r)
          )
          .catch(() =>
            setSummary({
              active_participating_count: 0,
              pending_won_count: 0,
            })
          )
      } else {
        setSummary({
          active_participating_count: 0,
          pending_won_count: 0,
        })
      }
    }

    update()

    window.addEventListener(
      'auth-updated',
      update
    )

    return () =>
      window.removeEventListener(
        'auth-updated',
        update
      )
  }, [])

  return (
<div className="flex min-h-screen flex-col bg-slate-50">
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="container flex flex-wrap items-center gap-4 py-4">
          <Link
            to="/"
            className="flex items-center gap-3"
          >
            <img
              src={logo}
              alt="Pawction"
              className="h-11 w-11 rounded-2xl shadow-sm"
            />

            <div>
              <div className="text-2xl font-black tracking-tight text-slate-900">
                Pawction
              </div>

              <div className="text-xs text-slate-500">
                Subastas solidarias
              </div>
            </div>
          </Link>

          <nav className="flex flex-wrap items-center gap-2">
            <NavItem to="/auctions">
              Subastas
            </NavItem>

            <NavItem to="/favorites">
              Favoritos
            </NavItem>

            <NavItem to="/history">
              Historial
            </NavItem>

            <NavItem
              to="/pending-orders"
              badge={
                isLogged
                  ? summary.pending_won_count
                  : 0
              }
            >
              Pendientes
            </NavItem>

            {isAdmin && (
              <NavItem to="/admin/auctions">
                Admin
              </NavItem>
            )}
          </nav>

          <UserMenu />
        </div>
      </header>

<main className="container flex-1 py-8">
          <Routes>
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/auctions"
            element={<Auctions />}
          />

          <Route
            path="/auctions/:id"
            element={<AuctionDetail />}
          />

          <Route
            path="/favorites"
            element={
              <PrivateRoute>
                <Favorites />
              </PrivateRoute>
            }
          />

          <Route
            path="/history"
            element={
              <PrivateRoute>
                <BidsHistory />
              </PrivateRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          <Route
            path="/checkout/:id"
            element={
              <PrivateRoute>
                <Checkout />
              </PrivateRoute>
            }
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/admin/auctions"
            element={<AdminAuctions />}
          />

          <Route
            path="/pending-orders"
            element={<PendingOrders />}
          />

          <Route
            path="/shipping/:id"
            element={<ShippingForm />}
          />

          <Route
            path="/fake-payment/:id"
            element={<FakePayment />}
          />

          <Route
            path="/payment/success"
            element={<PaymentSuccess />}
          />
        </Routes>
      </main>

      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="container flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xl font-black text-slate-900">
              Pawction
            </div>

            <p className="mt-2 max-w-md text-sm text-slate-500">
              Plataforma solidaria de subastas para apoyar
              la adopción responsable y causas
              medioambientales.
            </p>
          </div>

          <div className="flex flex-col items-start gap-2 text-sm text-slate-500">
            <div>
              © {new Date().getFullYear()} Pawction
            </div>

            <div>
              50% Pawction · 50% Greenpeace
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}