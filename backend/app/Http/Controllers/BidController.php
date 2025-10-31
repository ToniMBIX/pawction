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
            'amount'     => ['required','numeric','min:0.01'],
        ]);

        $auction = Auction::lockForUpdate()->findOrFail($data['auction_id']);

        if ($auction->status !== 'active') {
            throw ValidationException::withMessages(['auction'=>'La subasta no está activa.']);
        }

        $amount = (float)$data['amount'];

        if ((float)$auction->current_price <= 0) {
            if ($amount < 20) {
                throw ValidationException::withMessages(['amount'=>'La primera puja debe ser mínimo 20 €']);
            }
            // arranca contador en primera puja (ej: +48h; ajusta a tu regla)
            if (!$auction->end_at) {
                $auction->end_at = Carbon::now()->addHours(48);
            }
        } else {
            if ($amount <= (float)$auction->current_price) {
                throw ValidationException::withMessages(['amount'=>'La puja debe superar el precio actual.']);
            }
        }

        Bid::create([
            'auction_id' => $auction->id,
            'user_id'    => $request->user()->id,
            'amount'     => $amount,
        ]);

        $auction->current_price = $amount;
        $auction->save();

        return response()->json([
            'ok'      => true,
            'current' => $auction->current_price,
            'end_at'  => $auction->end_at,
        ], 201);
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
