import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShippingAPI, PaymentAPI } from "../lib/api.js";

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
      console.log("auction_id:", id);

      await ShippingAPI.submit({ ...form, auction_id: id });

      // Completar pago falso
      await PaymentAPI.completeFake(id);

      // Redirige a página de éxito
      navigate("/payment/success");
    } catch (err) {
      alert("Error al guardar los datos de envío:\n" + err.message);
    }
  };

  return (
    <div className="p-10 max-w-lg">
      <h1 className="text-2xl mb-4">Datos de envío</h1>

      {Object.keys(form).map((key) => (
        <input
          key={key}
          name={key}
          placeholder={key.replace("_", " ")}
          value={form[key]}
          onChange={change}
          className="border p-2 w-full mb-3"
        />
      ))}

      <button
        className="bg-blue-600 text-white px-4 py-2"
        onClick={submit}
      >
        Guardar y pagar
      </button>
    </div>
  );
}
