<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\{Auction,Payout};
use App\Services\PaymentService;

class PaymentController extends Controller {
    public function checkout(Request $request, Auction $auction, PaymentService $pay){
        // En producción: exigir que el usuario sea el ganador y la subasta esté finalizada.
        if(app()->environment('production')){
            abort_if($auction->status!=='finished' || $auction->winner_user_id !== $request->user()->id, 403, 'No autorizado');
        }
        $intent = $pay->createPaymentIntent($auction->id, $auction->current_price, 'EUR');
        return response()->json($intent);
    }
}
