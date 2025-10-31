<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\{Auction,Payout};
use App\Services\PaymentService;
use App\Jobs\SendTransactionalEmailJob;

class WebhookController extends Controller {
    public function stripe(Request $request, PaymentService $pay){
        $event = $pay->parseStripeWebhook($request);

        $type = $event['type'] ?? null;
        $object = $event['data']['object'] ?? [];

        if ($type === 'payment_intent.succeeded') {
            $metadata = $object['metadata'] ?? [];
            $auctionId = isset($metadata['auction_id']) ? intval($metadata['auction_id']) : null;

            if ($auctionId) {
                $auction = Auction::find($auctionId);
                if ($auction && $auction->status === 'finished' && !$auction->payed) {
                    // Marca como pagada
                    $auction->payed = true;
                    $auction->save();

                    // Crea payout 50/50
                    $total = floatval($auction->current_price);
                    $half  = round($total / 2, 2);
                    Payout::create([
                        'auction_id'        => $auction->id,
                        'total_amount'      => $total,
                        'pawction_amount'   => $half,
                        'greenpeace_amount' => $half,
                        'currency'          => 'EUR',
                    ]);

                    // Notifica al ganador con email + PDF con QR
                    if ($auction->winner_user_id) {
                        SendTransactionalEmailJob::dispatch($auction->winner_user_id, $auction->id);
                    }
                }
            }
        }

        return response()->json(['received'=>true]);
    }

    public function paypal(Request $request){
        // Placeholder si decides integrar PayPal más tarde.
        return response()->json(['ok'=>true]);
    }
}
