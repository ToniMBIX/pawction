import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PaymentAPI } from "../lib/api";

export default function FakePayment() {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const doPayment = async () => {
      try {
        await PaymentAPI.completeFake(id);   // ← AQUÍ SE ENVÍA EMAIL
        navigate("/payment/success");       // ← SOLO 1 VEZ
      } catch (err) {
        alert("Error al procesar pago: " + err.message);
      }
    };

    doPayment();
  }, [id]);

  return <h1>Procesando pago...</h1>;
}
