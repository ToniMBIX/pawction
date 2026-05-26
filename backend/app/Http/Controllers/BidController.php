<?php

namespace App\Http\Controllers;

use App\Models\Auction;
use App\Models\Bid;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BidController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'auction_id' => ['required', 'exists:auctions,id'],
            'amount' => ['required', 'integer', 'min:1'],
        ]);

        $userId = $request->user()->id;
        $auction = null;

        DB::transaction(function () use ($data, $userId, &$auction) {
            $auction = Auction::lockForUpdate()->findOrFail($data['auction_id']);

            if ($auction->status !== 'active') {
                throw ValidationException::withMessages([
                    'auction_id' => ['La subasta ya finalizó.'],
                ]);
            }

            if ($auction->end_at && now()->greaterThanOrEqualTo($auction->end_at)) {
                $auction->closeNow();

                throw ValidationException::withMessages([
                    'auction_id' => ['La subasta ya finalizó.'],
                ]);
            }

            $amount = (int) $data['amount'];
            $current = (int) $auction->current_price;
            $startingPrice = (int) ($auction->starting_price ?: 20);

            if ($current === 0) {
                if ($amount < $startingPrice) {
                    throw ValidationException::withMessages([
                        'amount' => ["La primera puja debe ser al menos de {$startingPrice} €."],
                    ]);
                }
            } else {
                $minNext = $current + 1;

                if ($amount < $minNext) {
                    throw ValidationException::withMessages([
                        'amount' => ["La puja mínima ahora es de {$minNext} €."],
                    ]);
                }
            }

            Bid::create([
                'auction_id' => $auction->id,
                'user_id' => $userId,
                'amount' => $amount,
            ]);

            $auction->current_price = $amount;
            $auction->end_at = now()->addMinute();
            $auction->save();
        });

        $auction->refresh()->load('product.animal');

        return response()->json([
            'success' => true,
            'message' => 'Puja registrada correctamente',
            'auction' => $auction,
        ], 201);
    }

    public function mine(Request $request)
    {
        $user = $request->user();

        $bids = Bid::where('user_id', $user->id)
            ->with(['auction.product.animal'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($b) {
                return [
                    'id' => $b->id,
                    'amount' => $b->amount,
                    'created_at' => $b->created_at,
                    'auction' => $b->auction ? [
                        'id' => $b->auction->id,
                        'title' => $b->auction->title,
                        'current_price' => $b->auction->current_price,
                        'starting_price' => $b->auction->starting_price,
                        'status' => $b->auction->status,
                        'image_url' => $b->auction->image_url,
                        'product' => $b->auction->product ? [
                            'animal' => $b->auction->product->animal ? [
                                'photo_url' => $b->auction->product->animal->photo_url,
                            ] : null,
                        ] : null,
                    ] : null,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $bids,
        ]);
    }
}