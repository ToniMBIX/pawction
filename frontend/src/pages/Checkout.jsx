import { loadStripe } from "@stripe/stripe-js";
import { PaymentAPI } from "../lib/api";
import { useParams } from "react-router-dom";

export default function Checkout() {

    const { id } = useParams();

    const pay = async () => {
        const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC);

        const res = await PaymentAPI.createSession({ auction_id: id });

        await stripe.redirectToCheckout({
            sessionId: res.data.id
        });
    };

    return (
        <div className="p-10">
            <h1 className="text-3xl font-bold mb-4">Finalizar pago</h1>

            <button
                onClick={pay}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg"
            >
                Pagar ahora
            </button>
        </div>
    );
}
