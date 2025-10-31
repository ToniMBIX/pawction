<?php

namespace App\Http\Controllers;

use App\Models\{Auction,Bid};
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class BidController extends Controller
{
    public function store(Request $request)
{
    $data = $request->validate([
        'auction_id' => ['required','exists:auctions,id'],
        'amount' => ['required','numeric','min:0'],
    ]);

    $auction = \App\Models\Auction::findOrFail($data['auction_id']);
    $user = $request->user();

    // Si es la primera puja
    $min = $auction->current_price > 0 ? $auction->current_price + 1 : 20;
    if ($data['amount'] < $min) {
        return response()->json(['message'=>"La puja mínima actual es de {$min}€"], 422);
    }

    $auction->bids()->create([
        'user_id' => $user->id,
        'amount' => $data['amount']
    ]);

    // Si es la primera puja, inicia o reinicia temporizador
    if (!$auction->end_at || now()->greaterThan($auction->end_at)) {
        $auction->end_at = now()->addDay();
    } else {
        $auction->end_at = now()->addDay();
    }
    $auction->current_price = $data['amount'];
    $auction->save();

    return response()->json(['message'=>'Puja registrada', 'auction'=>$auction->fresh()]);
}

    public function mine(Request $request)
    {
        $user = $request->user();

        $bids = Bid::where('user_id', $user->id)
            ->with(['auction.product.animal'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function($b){
                return [
                    'id'        => $b->id,
                    'amount'    => $b->amount,
                    'created_at'=> $b->created_at,
                    'auction'   => $b->auction ? [
                        'id'            => $b->auction->id,
                        'title'         => $b->auction->title,
                        'current_price' => $b->auction->current_price,
                        'image_url'     => $b->auction->image_url,
                        'product'       => $b->auction->product ? [
                            'animal' => $b->auction->product->animal ? [
                                'photo_url' => $b->auction->product->animal->photo_url
                            ] : null
                        ] : null,
                    ] : null,
                ];
            });

        return response()->json($bids);
    }

}
