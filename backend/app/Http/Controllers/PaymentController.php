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

    public function paymentSuccess()
{
    return response()->json([
        "success" => true,
        "message" => "Pago completado correctamente"
    ]);
}


    public function fakeComplete(Request $request)
{
    $validated = $request->validate([
        'auction_id' => 'required|exists:auctions,id',
    ]);

    $user = auth()->user();

    if (!$user) {
        return response()->json([
            'success' => false,
            'message' => 'Usuario no autenticado',
        ], 401);
    }

    $auction = Auction::findOrFail($validated['auction_id']);

    if ((int) $auction->winner_user_id !== (int) $user->id) {
        return response()->json([
            'success' => false,
            'message' => 'No puedes pagar una subasta que no has ganado',
        ], 403);
    }

    if ($auction->is_paid) {
        return response()->json([
            'success' => true,
            'message' => 'Esta subasta ya estaba pagada',
        ]);
    }

    $auction->is_paid = true;
    $auction->payed = true;
    $auction->status = 'finished';
    $auction->save();

    try {
        Mail::to($user->email)->send(new PaymentCompleted($auction));
    } catch (\Exception $e) {
    \Log::warning('No se pudo enviar el correo de pago completado', [
        'error' => $e->getMessage(),
    ]);
}
    return response()->json([
        'success' => true,
        'message' => 'Pago completado y correo enviado',
    ]);
}

}
