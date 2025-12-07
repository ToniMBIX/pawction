import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShippingAPI, PaymentAPI } from "../lib/api";

export default function ShippingForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    address: "",
    city: "",
    province: "",
    country: "",
    postal_code: "",
    phone: ""
  });

  const change = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    try {
      await ShippingAPI.submit({ ...form, auction_id: id });

      // ✔️ CORRECTO: usar PaymentAPI
      await PaymentAPI.completeFake(id);

      // Luego rediriges donde quieras
      navigate(`/payment/success`);
    } catch (err) {
      alert("Error al guardar los datos de envío:\n" + err.message);
    }
  };

  return (...);
}
