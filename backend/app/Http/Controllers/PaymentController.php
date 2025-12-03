<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use App\Models\Auction;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use App\Mail\ShippingFormMail;

class PaymentController extends Controller
{
    public function createCheckoutSession(Request $request)
    {
        $auction = Auction::findOrFail($request->auction_id);

        Stripe::setApiKey(env('STRIPE_SECRET'));

        $session = Session::create([
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => 'eur',
                    'product_data' => [
                        'name' => $auction->title,
                    ],
                    'unit_amount' => intval($auction->current_price * 100),
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'success_url' => url('/api/payment/success?auction_id=' . $auction->id),
            'cancel_url' => url('/api/payment/cancel'),
        ]);

        return response()->json(['id' => $session->id]);
    }


    public function paymentSuccess(Request $request)
    {
        $auction = Auction::findOrFail($request->auction_id);
        $auction->status = "paid";

        // Generar un token para el formulario de envío
        $auction->shipping_token = bin2hex(random_bytes(16));
        $auction->save();

        // Enviar email al ganador
        Mail::to($auction->winner->email)->send(
            new ShippingFormMail($auction)
        );

        return response()->json([
            "message" => "Pago completado. Revisa tu email para confirmar el envío."
        ]);
    }
}
