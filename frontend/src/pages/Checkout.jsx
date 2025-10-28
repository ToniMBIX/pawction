import React from 'react'
import { useParams } from 'react-router-dom'
import { PaymentAPI } from '../lib/api.js'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

function CheckoutForm({ clientSecret }){
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = React.useState(false)
  const onPay = async () => {
    if(!stripe || !elements) return
    setLoading(true)
    const { error } = await stripe.confirmPayment({ elements, confirmParams: {} })
    if(error){ alert(error.message) } else { alert('Pago confirmado. Recibirás un email con el PDF.') }
    setLoading(false)
  }
  return (
    <div className="card">
      <PaymentElement />
      <button className="btn mt-3" onClick={onPay} disabled={!stripe || loading}>{loading?'Procesando...':'Pagar'}</button>
    </div>
  )
}

export default function Checkout(){
  const { id } = useParams()
  const [intent, setIntent] = React.useState(null)
  const [stripePromise, setStripePromise] = React.useState(() => loadStripe(import.meta.env.VITE_STRIPE_KEY || 'pk_test_xxx'))

  React.useEffect(()=>{ PaymentAPI.checkout(id).then(setIntent).catch(e=>alert(e.message)) },[id])

  if(!intent?.client_secret) return <div>Cargando...</div>
  return (
    <Elements options={{ clientSecret: intent.client_secret }} stripe={stripePromise}>
      <CheckoutForm clientSecret={intent.client_secret} />
    </Elements>
  )
}
