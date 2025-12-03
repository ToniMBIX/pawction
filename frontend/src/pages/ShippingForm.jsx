import { useState } from "react";
import { ShippingAPI } from "../lib/api";

export default function ShippingForm() {

    const [form, setForm] = useState({
        full_name: "",
        address: "",
        city: "",
        province: "",
        postal_code: "",
        phone: "",
        notes: "",
        token: new URLSearchParams(window.location.search).get("token")
    });

    const handleChange = e => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const submit = async e => {
        e.preventDefault();
        await ShippingAPI.submit(form);
        alert("Datos de envío confirmados.");
    };

    return (
        <div className="max-w-xl mx-auto p-10">
            <h1 className="text-2xl font-bold mb-4">Confirmar envío</h1>

            <form onSubmit={submit} className="grid gap-4">
                <input className="input" name="full_name" placeholder="Nombre completo" onChange={handleChange} />
                <input className="input" name="address" placeholder="Dirección" onChange={handleChange} />
                <input className="input" name="city" placeholder="Ciudad" onChange={handleChange} />
                <input className="input" name="province" placeholder="Provincia" onChange={handleChange} />
                <input className="input" name="postal_code" placeholder="Código Postal" onChange={handleChange} />
                <input className="input" name="phone" placeholder="Teléfono" onChange={handleChange} />
                <textarea className="input" name="notes" placeholder="Notas (opcional)" onChange={handleChange}></textarea>

                <button className="bg-green-600 text-white px-4 py-2 rounded">
                    Enviar datos
                </button>
            </form>
        </div>
    );
}
