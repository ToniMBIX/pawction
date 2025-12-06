<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Auction;
use App\Models\Bid;

class FakePaymentController extends Controller
{
    public function pay(Request $request)
    {
        $request->validate([
            'auction_id' => 'required|exists:auctions,id'
        ]);

        $auction = Auction::findOrFail($request->auction_id);

        $userId = auth()->id();

        // Obtener última puja
        $lastBid = Bid::where('auction_id', $auction->id)
            ->orderBy('amount', 'desc')
            ->first();

        // Si no hay ganador asignado, lo asignamos ahora
        if (!$auction->winner_user_id) {
            if ($lastBid) {
                $auction->winner_user_id = $lastBid->user_id;
            } else {
                $auction->winner_user_id = $userId; // fallback
            }
        }

        // Si el usuario que paga no es el ganador → asignarlo como ganador
        if ($auction->winner_user_id !== $userId) {
            $auction->winner_user_id = $userId;
        }

        // Marcar como pagada
        $auction->is_paid = true;
        $auction->save();

        return response()->json([
            "success" => true,
            "message" => "Pago simulado realizado, subasta marcada como pagada"
        ]);
    }
}
