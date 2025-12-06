<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Auction;
use App\Models\ShippingDetail;
use Illuminate\Support\Facades\Mail;
use App\Mail\PaymentCompleted;


class PaymentController extends Controller
{
    public function fakeStart(Request $request)
    {
        $auction = Auction::findOrFail($request->auction_id);

        return response()->json([
            "auction" => $auction
        ]);
    }

    public function fakeComplete(Request $request)
{
    $validated = $request->validate([
        'auction_id' => 'required|exists:auctions,id',
    ]);

    $auction = Auction::findOrFail($validated['auction_id']);

    // Obtener usuario logueado
    $user = auth()->user();

    if (!$user) {
        return response()->json([
            "success" => false,
            "message" => "Usuario no autenticado"
        ], 401);
    }

    if (!$user->email) {
        return response()->json([
            "success" => false,
            "message" => "El usuario no tiene email registrado"
        ], 422);
    }

    // Marcar como pagado
    $auction->is_paid = true;
    $auction->winner_id = $user->id;
    $auction->winner_email = $user->email;
    $auction->save();

    // Enviar correo
    try {
Mail::to($user->email)->send(new PaymentCompleted($auction));
    } catch (\Exception $e) {
        return response()->json([
            "success" => true,
            "warning" => "Pago marcado, pero no se pudo enviar el correo",
            "error" => $e->getMessage()
        ]);
    }

    return response()->json([
        "success" => true,
        "message" => "Pago completado y correo enviado"
    ]);
}

}
