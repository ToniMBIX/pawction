<?php
namespace App\Services;

use Illuminate\Http\Request;
use Stripe\StripeClient;
use Stripe\Webhook;

class PaymentService {
    protected $stripe;
    public function __construct(){
        $this->stripe = new StripeClient(env('STRIPE_SECRET'));
    }

    public function createPaymentIntent($auctionId, $amount, $currency='EUR'){
        $pi = $this->stripe->paymentIntents->create([
            'amount' => (int) round($amount * 100),
            'currency' => $currency,
            'metadata' => ['auction_id'=>$auctionId],
            'automatic_payment_methods' => ['enabled'=>true],
        ]);
        return [
            'provider'=>'stripe',
            'client_secret'=>$pi->client_secret,
            'id'=>$pi->id,
            'amount'=>$amount,
            'currency'=>$currency
        ];
    }

    public function parseStripeWebhook(Request $request){
        $payload = $request->getContent();
        $sig = $request->header('Stripe-Signature');
        $secret = env('STRIPE_WEBHOOK_SECRET');
        if(!$secret){
            // Fallback (no verificación en desarrollo)
            return json_decode($payload, true);
        }
        $event = Webhook::constructEvent($payload, $sig, $secret);
        return $event->jsonSerialize();
    }
}
