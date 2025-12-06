import { useParams, useNavigate } from "react-router-dom";

export default function Checkout() {
    const { id } = useParams();
    const navigate = useNavigate();

    const pay = () => {
        // Redirige a la pasarela falsa
        navigate(`/fake-payment?auction_id=${id}`);
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
