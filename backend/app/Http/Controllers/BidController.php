<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\{Auction,Bid};
use App\Jobs\CloseAuctionJob;
use Carbon\Carbon;

class BidController extends Controller {
    public function store(Request $req)
{
    $data = $req->validate([
        'auction_id' => ['required','exists:auctions,id'],
        'amount'     => ['required','numeric','min:0.01'],
    ]);

    $user = $req->user();

    // Bloqueo optimista: evita condiciones de carrera en pujas simultáneas
    $auction = \DB::transaction(function() use ($data, $user) {
        $auction = \App\Models\Auction::lockForUpdate()->findOrFail($data['auction_id']);

        if ($auction->status !== 'active') {
            abort(response()->json(['message'=>'La subasta no está activa'], 422));
        }

        if (is_null($auction->end_at)) {
            // PRIMERA PUJA
            if ($data['amount'] < 20) {
                abort(response()->json(['message'=>'La primera puja debe ser al menos 20€'], 422));
            }
            $auction->starting_price = 20.00;
            $auction->current_price = max(20.00, $data['amount']);
            // Arranca la cuenta atrás (ajusta horas si quieres)
            $auction->end_at = now()->addHours(24);
        } else {
            // SIGUIENTES PUJAS
            if ($data['amount'] <= $auction->current_price) {
                abort(response()->json(['message'=>'La puja debe superar el precio actual'], 422));
            }
            $auction->current_price = $data['amount'];
        }

        $auction->save();

        $auction->bids()->create([
            'user_id' => $user->id,
            'amount'  => $data['amount'],
        ]);

        return $auction->fresh()->load('product.animal');
    });

    return response()->json([
        'ok'      => true,
        'auction' => $auction
    ], 201);
}



}
