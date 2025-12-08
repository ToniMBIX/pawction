<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Auction;
use App\Models\Bid; 
use Illuminate\Support\Facades\Mail;
use App\Mail\PaymentCompleted;

class FakePaymentController extends Controller
{
    public function pay(Request $request)
    {
        $request->validate([
            'auction_id' => 'required|exists:auctions,id'
        ]);

        $auction = Auction::findOrFail($request->auction_id);

        $user = auth()->user();
        if (!$user) {
            return response()->json([
                "success" => false,
                "message" => "Usuario no autenticado"
            ], 401);
        }

        $userId = $user->id;

        // Obtener última puja
        $lastBid = Bid::where('auction_id', $auction->id)
            ->orderBy('amount', 'desc')
            ->first();

        // Asignar ganador si no existe
        if (!$auction->winner_user_id) {
            if ($lastBid) {
                $auction->winner_user_id = $lastBid->user_id;
            } else {
                $auction->winner_user_id = $userId; // fallback
            }
        }

        // Si quien paga no es el ganador → hacerlo ganador
        if ($auction->winner_user_id !== $userId) {
            $auction->winner_user_id = $userId;
        }

        // Guardar correo de ganador
        $auction->winner_email = $user->email;

        // Marcar como pagado
        $auction->is_paid = true;
        $auction->status = 'finished';
        $auction->save();

        // =============================
        //  Envío del email corregido
        // =============================
        try {
            Mail::to($user->email)->send(new PaymentCompleted($auction));
        } catch (\Exception $e) {
            return response()->json([
                "success" => true,
                "warning" => "Pago marcado pero NO se pudo enviar el correo",
                "error" => $e->getMessage()
            ]);
        }

        return response()->json([
            "success" => true,
            "message" => "Pago simulado realizado y correo enviado"
        ]);
    }
}
