import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PaymentAPI } from "../lib/api";

export default function FakePayment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const doPayment = async () => {
      setError("");
      setLoading(true);

      try {
        await PaymentAPI.completeFake(id);

        navigate("/payment/success");
      } catch (err) {
        setError(err.message || "Error al procesar el pago");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    doPayment();
  }, [id, navigate]);

  return (
    <div className="card max-w-md mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">
        Procesando pago...
      </h1>

      {loading && (
        <p className="opacity-70">
          Espera unos segundos mientras procesamos tu pago.
        </p>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}