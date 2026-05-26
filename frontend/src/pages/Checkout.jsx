import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Auth } from '../lib/auth.js'

export default function Checkout() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  const pay = async () => {
    if (!Auth.isLogged()) {
      setError('Debes iniciar sesión para continuar')
      return
    }

    setLoading(true)
    setError('')

    try {
      navigate(`/fake-payment/${id}`)
    } catch (err) {
      console.error(err)

      setError(
        err.message || 'No se pudo iniciar el pago'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">
        Finalizar pago
      </h1>

      <p className="opacity-70 mb-6">
        Vas a acceder a la pasarela de pago de Pawction.
      </p>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        onClick={pay}
        className="btn w-full"
        disabled={loading}
      >
        {loading ? 'Redirigiendo...' : 'Pagar ahora'}
      </button>
    </div>
  )
}