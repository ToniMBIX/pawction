<?php

namespace App\Http\Controllers;

use App\Mail\PaymentCompleted;
use App\Models\Auction;
use App\Models\ShippingDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use App\Services\PawctionMailer;

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

        app(PawctionMailer::class)->paymentCompleted(
    $auction->fresh(['product.animal', 'shippingDetail']),
    $user->email
);

        return response()->json([
            'success' => true,
            'message' => 'Pago completado correctamente.',
            'auction' => $auction->fresh('product.animal'),
        ]);
    }

    public function createStripeCheckout(Request $request)
{
    $validated = $request->validate([
        'auction_id' => ['required', 'exists:auctions,id'],
    ]);

    $user = $request->user();

    $auction = Auction::with('product.animal')->findOrFail($validated['auction_id']);

    if ((int) $auction->winner_user_id !== (int) $user->id) {
        return response()->json([
            'success' => false,
            'message' => 'No puedes pagar una subasta que no has ganado.',
        ], 403);
    }

    if ($auction->status !== 'finished') {
        return response()->json([
            'success' => false,
            'message' => 'La subasta todavía no ha finalizado.',
        ], 422);
    }

    if ($auction->is_paid) {
        return response()->json([
            'success' => false,
            'message' => 'Esta subasta ya está pagada.',
        ], 422);
    }

    if ($auction->paid_limit_at && now()->greaterThanOrEqualTo($auction->paid_limit_at)) {
        return response()->json([
            'success' => false,
            'message' => 'El plazo de pago ha expirado.',
        ], 422);
    }

    $shipping = ShippingDetail::where('auction_id', $auction->id)
        ->where('user_id', $user->id)
        ->first();

    if (!$shipping) {
        return response()->json([
            'success' => false,
            'message' => 'Debes completar los datos de envío antes de pagar.',
        ], 422);
    }

    Stripe::setApiKey(config('services.stripe.secret', env('STRIPE_SECRET')));

    $amount = (int) $auction->current_price;

    if ($amount <= 0) {
        return response()->json([
            'success' => false,
            'message' => 'El importe de la subasta no es válido.',
        ], 422);
    }

    $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');

    $session = Session::create([
        'mode' => 'payment',
        'payment_method_types' => ['card'],
        'customer_email' => $user->email,

        'line_items' => [[
            'price_data' => [
                'currency' => 'eur',
                'unit_amount' => $amount * 100,
                'product_data' => [
                    'name' => $auction->product->name ?? $auction->title,
                    'description' => 'Subasta Pawction #' . $auction->id,
                ],
            ],
            'quantity' => 1,
        ]],

        'metadata' => [
            'auction_id' => (string) $auction->id,
            'user_id' => (string) $user->id,
        ],

        'payment_intent_data' => [
            'metadata' => [
                'auction_id' => (string) $auction->id,
                'user_id' => (string) $user->id,
            ],
        ],

        'success_url' => $frontendUrl . '/payment/success?session_id={CHECKOUT_SESSION_ID}',
        'cancel_url' => $frontendUrl . '/pending-orders',
    ]);

    return response()->json([
        'success' => true,
        'checkout_url' => $session->url,
    ]);
}

public function confirmStripePayment(Request $request)
{
    $validated = $request->validate([
        'session_id' => ['required', 'string'],
    ]);

    $user = $request->user();

    Stripe::setApiKey(config('services.stripe.secret', env('STRIPE_SECRET')));

    $session = Session::retrieve($validated['session_id']);

    if ($session->payment_status !== 'paid') {
        return response()->json([
            'success' => false,
            'message' => 'El pago todavía no está confirmado.',
        ], 422);
    }

    $auctionId = $session->metadata->auction_id ?? null;

    if (!$auctionId) {
        return response()->json([
            'success' => false,
            'message' => 'La sesión de Stripe no contiene auction_id.',
        ], 422);
    }

    $auction = Auction::with('product.animal')->findOrFail($auctionId);

    if ((int) $auction->winner_user_id !== (int) $user->id) {
        return response()->json([
            'success' => false,
            'message' => 'No puedes confirmar el pago de esta subasta.',
        ], 403);
    }

    if (!$auction->is_paid) {
        $auction->is_paid = true;
        $auction->payed = true;
        $auction->status = 'finished';
        $auction->save();

        try {
app(PawctionMailer::class)->paymentCompleted(
    $auction->fresh(['product.animal', 'shippingDetail']),
    $user->email
);        } catch (\Throwable $e) {
            \Log::warning('No se pudo enviar email de pago Stripe', [
                'auction_id' => $auction->id,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    return response()->json([
        'success' => true,
        'message' => 'Pago confirmado correctamente.',
        'auction' => $auction->fresh('product.animal'),
    ]);
}
}