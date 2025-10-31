<?php

namespace App\Http\Controllers;

use App\Models\Auction;
use App\Models\Bid;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Carbon;
use App\Jobs\CloseAuctionJob;

class BidController extends Controller
{
    /**
     * Duración dinámica: cada nueva puja reinicia el contador a 24h
     */
    private int $durationMinutes = 24 * 60; // 24h

    public function store(Request $req, Auction $auction)
    {
        $req->validate([
            'amount' => ['required','numeric','min:0.01'],
        ]);

        if (!$auction->isActive()) {
            throw ValidationException::withMessages(['auction' => 'La subasta no está activa.']);
        }

        $amount = floatval($req->input('amount'));
        $current = floatval($auction->current_price ?? 0);

        // Reglas:
        // - Si no hay pujas previas, primera puja mínima 20€
        // - Si ya hay pujas, la nueva puja debe superar el precio actual
        if ($current <= 0) {
            if ($amount < 20) {
                throw ValidationException::withMessages(['amount' => 'La primera puja debe ser de al menos 20€.']);
            }
        } else {
            if ($amount <= $current) {
                throw ValidationException::withMessages(['amount' => 'La puja debe superar el precio actual.']);
            }
        }

        // Reinicia la cuenta atrás a 24h desde AHORA
        $auction->end_at = Carbon::now()->addMinutes($this->durationMinutes);
        $auction->current_price = $amount;
        $auction->winner_user_id = $req->user()->id; // ganador provisional
        $auction->status = 'active';
        $auction->save();

        // Programa/rehace el cierre a end_at (si hay pujas posteriores, el job se anula por la condición de tiempo)
        CloseAuctionJob::dispatch($auction->id)->delay($auction->end_at);

        // Registra la puja
        $bid = Bid::create([
            'user_id'    => $req->user()->id,
            'auction_id' => $auction->id,
            'amount'     => $amount,
        ]);

        return response()->json([
            'ok'      => true,
            'auction' => $auction->load('product.animal'),
            'bid'     => $bid,
        ]);
    }
}
