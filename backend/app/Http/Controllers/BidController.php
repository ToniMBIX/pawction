<?php

namespace App\Http\Controllers;

use App\Models\{Auction, Bid};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BidController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'auction_id' => ['required', 'exists:auctions,id'],
            'amount'     => ['required', 'integer', 'min:1'],
        ]);

        $userId  = $request->user()->id;
        $auction = null;

        DB::transaction(function () use ($data, $userId, &$auction) {

            // 🔐 Bloqueo para evitar condiciones de carrera
            $auction = Auction::lockForUpdate()->findOrFail($data['auction_id']);

            // 🚫 No permitir pujar si no está activa
            if ($auction->status !== 'active') {
                abort(422, 'La subasta ya finalizó.');
            }

            // ⏳ SI EL TIEMPO YA EXPIRÓ → cerrar subasta
            if ($auction->end_at && now()->greaterThanOrEqualTo($auction->end_at)) {

                $lastBid = Bid::where('auction_id', $auction->id)
                    ->orderByDesc('amount')
                    ->orderByDesc('id')
                    ->first();

                $auction->status = 'finished';
                $auction->winner_user_id = $lastBid?->user_id;
                $auction->save();

                abort(422, 'La subasta ya finalizó.');
            }

            $amount  = (int) $data['amount'];
            $current = (int) $auction->current_price;

            // 🧮 Reglas de puja
            if ($current === 0) {
                if ($amount < 20) {
                    abort(422, 'La primera puja debe ser al menos de 20 €.');
                }
            } else {
                $minNext = $current + 1;
                if ($amount < $minNext) {
                    abort(422, "La puja mínima ahora es de {$minNext} €.");
                }
            }

            // 💾 Guardar la puja
            Bid::create([
                'auction_id' => $auction->id,
                'user_id'    => $userId,
                'amount'     => $amount,
            ]);

            // ⏱ Reiniciar cuenta atrás a 1 minuto
            $auction->current_price = $amount;
            $auction->end_at        = now()->addMinute();
            $auction->save();
        });

        // 🔄 Devolver la subasta actualizada
        $auction->refresh()->load('product.animal');

        return response()->json([
            'message' => 'Puja registrada',
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
                    'id'         => $b->id,
                    'amount'     => $b->amount,
                    'created_at' => $b->created_at,
                    'auction'    => $b->auction ? [
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
