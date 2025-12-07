import { useEffect, useState } from "react";
import { ShippingAPI } from "../lib/api";
import { useNavigate } from "react-router-dom";
import { Auth } from "../lib/auth.js";

export default function PendingOrders() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    ShippingAPI.listPending().then(setOrders);
  }, []);

  // FIX: tu Auth NO tiene loggedIn(), pero sí token()
  if (!Auth.token()) 
    return <p className="p-10">Debes iniciar sesión para ver tus pedidos pendientes.</p>;

  return (
    <div className="p-10">
      <h1 className="text-2xl mb-4">Subastas pendientes de pago</h1>

      {orders.length === 0 && <p>No tienes pedidos pendientes.</p>}

      {orders.map(a => (
        <div key={a.id} className="border p-4 mb-4 rounded-md">
          <h2 className="text-xl">{a.title}</h2>
          <p>Precio final: {a.current_price} €</p>

          <button
            className="bg-green-600 text-white px-4 py-2 mt-2 rounded"
            onClick={() => navigate(`/shipping-form/${a.id}`)}
          >
            Completar datos de envío
          </button>
        </div>
      ))}
    </div>
  );
}
