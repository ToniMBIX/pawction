import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShippingAPI } from "../lib/api";

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
      await ShippingAPI.submit({
        ...form,
        auction_id: id
      });

      navigate(`/fake-payment?auction_id=${id}`);
    } catch (err) {
      alert("Error al guardar los datos de envío: " + err.message);
    }
  };

  return (
    <div className="p-10 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Datos de envío</h1>

      <div className="flex flex-col gap-3">

        <input
          name="full_name"
          placeholder="Nombre completo"
          value={form.full_name}
          onChange={change}
          className="border p-2 w-full"
          required
        />

        <input
          name="address"
          placeholder="Dirección"
          value={form.address}
          onChange={change}
          className="border p-2 w-full"
          required
        />

        <input
          name="city"
          placeholder="Ciudad"
          value={form.city}
          onChange={change}
          className="border p-2 w-full"
          required
        />

        <input
          name="province"
          placeholder="Provincia"
          value={form.province}
          onChange={change}
          className="border p-2 w-full"
          required
        />

        <input
          name="country"
          placeholder="País"
          value={form.country}
          onChange={change}
          className="border p-2 w-full"
          required
        />

        <input
          name="postal_code"
          placeholder="Código postal"
          value={form.postal_code}
          onChange={change}
          className="border p-2 w-full"
          required
        />

        <input
          name="phone"
          placeholder="Teléfono"
          value={form.phone}
          onChange={change}
          className="border p-2 w-full"
          required
        />

        <button
          className="bg-blue-600 text-white px-4 py-2 mt-3 rounded"
          onClick={submit}
        >
          Guardar y pagar
        </button>
      </div>
    </div>
  );
}
