import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShippingAPI } from "../lib/api.js";

export default function ShippingForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); // 🔥 mensajes de error por campo

  const [form, setForm] = useState({
    full_name: "",
    address: "",
    city: "",
    province: "",
    country: "",
    postal_code: "",
    phone: ""
  });

  const labels = {
    full_name: "Nombre completo",
    address: "Dirección",
    city: "Ciudad",
    province: "Provincia",
    country: "País",
    postal_code: "Código postal",
    phone: "Teléfono"
  };

  const change = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // limpia error al escribir
  };

  const validate = () => {
    let newErrors = {};

    if (!form.full_name.trim()) newErrors.full_name = "El nombre es obligatorio.";
    if (!form.address.trim()) newErrors.address = "La dirección es obligatoria.";
    if (!form.city.trim()) newErrors.city = "La ciudad es obligatoria.";
    if (!form.province.trim()) newErrors.province = "La provincia es obligatoria.";
    if (!form.country.trim()) newErrors.country = "El país es obligatorio.";
    if (!form.postal_code.trim()) newErrors.postal_code = "El código postal es obligatorio.";
    else if (form.postal_code.length < 4)
      newErrors.postal_code = "Código postal demasiado corto.";

    if (!form.phone.trim()) newErrors.phone = "El teléfono es obligatorio.";
    else if (!/^[0-9+\-\s]{6,}$/.test(form.phone))
      newErrors.phone = "Formato de teléfono no válido.";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const submit = async () => {
    if (!validate()) return; // ❌ detener si hay errores

    try {
      setLoading(true);

      await ShippingAPI.submit({ ...form, auction_id: id });
      navigate(`/fake-payment/${id}`);
      
    } catch (err) {
      alert("Error al guardar los datos de envío:\n" + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-lg">
      <h1 className="text-2xl mb-4">Datos de envío</h1>

      {Object.keys(form).map((key) => (
        <div key={key} className="mb-4">
          <input
            name={key}
            placeholder={labels[key]}
            value={form[key]}
            onChange={change}
            required
            className={`border p-2 w-full ${
              errors[key] ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors[key] && (
            <p className="text-red-500 text-sm mt-1">{errors[key]}</p>
          )}
        </div>
      ))}

      <button
        disabled={loading}
        className={`px-4 py-2 text-white ${
          loading ? "bg-gray-400" : "bg-blue-600"
        }`}
        onClick={submit}
      >
        {loading ? "Guardando..." : "Guardar y pagar"}
      </button>
    </div>
  );
}
