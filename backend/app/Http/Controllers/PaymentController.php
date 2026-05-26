<?php

namespace App\Http\Controllers;

use App\Mail\PaymentCompleted;
use App\Models\Auction;
use App\Models\ShippingDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class PaymentController extends Controller
{
    public function fakeStart(Request $request)
    {
        $validated = $request->validate([
            'auction_id' => ['required', 'exists:auctions,id'],
        ]);

        $user = $request->user();

        $auction = Auction::with('product.animal')
            ->findOrFail($validated['auction_id']);

        if ((int) $auction->winner_user_id !== (int) $user->id) {
            throw ValidationException::withMessages([
                'auction_id' => ['No puedes pagar una subasta que no has ganado.'],
            ]);
        }

        if ($auction->is_paid) {
            throw ValidationException::withMessages([
                'auction_id' => ['Esta subasta ya está pagada.'],
            ]);
        }

        if ($auction->status !== 'finished') {
            throw ValidationException::withMessages([
                'auction_id' => ['La subasta todavía no está finalizada.'],
            ]);
        }

        if ($auction->paid_limit_at && now()->greaterThanOrEqualTo($auction->paid_limit_at)) {
            throw ValidationException::withMessages([
                'auction_id' => ['El plazo de pago de esta subasta ha expirado.'],
            ]);
        }

        return response()->json([
            'success' => true,
            'auction' => $auction,
        ]);
    }

    public function paymentSuccess()
    {
        return response()->json([
            'success' => true,
            'message' => 'Pago completado correctamente',
        ]);
    }

    public function fakeComplete(Request $request)
    {
        $validated = $request->validate([
            'auction_id' => ['required', 'exists:auctions,id'],
        ]);

        $user = $request->user();

        $auction = Auction::with('product.animal')
            ->findOrFail($validated['auction_id']);

        if ((int) $auction->winner_user_id !== (int) $user->id) {
            throw ValidationException::withMessages([
                'auction_id' => ['No puedes pagar una subasta que no has ganado.'],
            ]);
        }

        if ($auction->status !== 'finished') {
            throw ValidationException::withMessages([
                'auction_id' => ['La subasta todavía no está finalizada.'],
            ]);
        }

        if ($auction->is_paid) {
            return response()->json([
                'success' => true,
                'message' => 'Esta subasta ya estaba pagada.',
                'auction' => $auction,
            ]);
        }

        if ($auction->paid_limit_at && now()->greaterThanOrEqualTo($auction->paid_limit_at)) {
            throw ValidationException::withMessages([
                'auction_id' => ['El plazo de pago de esta subasta ha expirado.'],
            ]);
        }

        $shipping = ShippingDetail::where('auction_id', $auction->id)
            ->where('user_id', $user->id)
            ->first();

        if (!$shipping) {
            throw ValidationException::withMessages([
                'shipping' => ['Debes completar los datos de envío antes de pagar.'],
            ]);
        }

        $auction->is_paid = true;
        $auction->payed = true;
        $auction->status = 'finished';
        $auction->save();

        try {
            Mail::to($user->email)->send(new PaymentCompleted($auction));
        } catch (\Throwable $e) {
            \Log::warning('No se pudo enviar email de pago completado', [
                'auction_id' => $auction->id,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Pago completado correctamente.',
            'auction' => $auction->fresh('product.animal'),
        ]);
    }
}