import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { PaymentAPI } from "../lib/api.js";

export default function FakePayment() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const auction_id = params.get("auction_id");

  const [auction, setAuction] = useState(null);

  useEffect(() => {
    PaymentAPI.startFake(auction_id).then((res) => setAuction(res.auction));
  }, []);

  const finish = async () => {
    await PaymentAPI.completeFake(auction_id);
    navigate("/payment-success");
  };

  if (!auction) return <p>Cargando...</p>;

  return (
    <div className="p-10">
      <h1 className="text-xl mb-2">Simulación de pago</h1>

      <p>Estás pagando: <b>{auction.title}</b></p>
      <p>Total: {auction.final_price} €</p>

      <button
        onClick={finish}
        className="bg-green-600 text-white px-4 py-2 mt-4"
      >
        Finalizar compra
      </button>
    </div>
  );
}
