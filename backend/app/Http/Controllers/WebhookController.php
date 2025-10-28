<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\{Auction,Payout};
use App\Services\PaymentService;
use App\Jobs\SendTransactionalEmailJob;

class WebhookController extends Controller {
    public function stripe(Request $request, PaymentService $pay){
        $event = $pay->parseStripeWebhook($request);

        $type = $event['type'] ?? null;
        $data = $event['data']['object'] ?? [];
        if($type === 'payment_intent.succeeded'){
            $metadata = $data['metadata'] ?? [];
            $auctionId = $metadata['auction_id'] ?? null;

            if($auctionId){
                $auction = Auction::find($auctionId);
                if($auction && !$auction->payed){
                    $auction->payed = true; $auction->status = 'finished'; $auction->save();
                    $total = $auction->current_price;
                    Payout::create([
                        'auction_id'=>$auction->id,
                        'total_amount'=>$total,
                        'pawction_amount'=>$total/2,
                        'greenpeace_amount'=>$total/2,
                        'currency'=>'EUR'
                    ]);
                    if($auction->winner_user_id){
                       SendTransactionalEmailJob::dispatch($auction->winner_user_id, $auction->id);
                    }
                }
            }
        }

        return response()->json(['received'=>true]);
    }

    public function paypal(Request $request){
        return response()->json(['ok'=>true]);
    }
}
