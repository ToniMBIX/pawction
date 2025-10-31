<?php

namespace App\Http\Controllers;

use App\Models\Auction;
use App\Models\Bid;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Carbon;

class BidController extends Controller
{
    // Config: duración de subasta tras primera puja
    private int $durationMinutes = 48 * 60; // 48h

    public function store(Request $req)
    {
        $data = $req->validate([
            'auction_id' => 'required|exists:auctions,id',
            'amount'     => 'required|numeric|min:0.01',
        ]);

        $auction = Auction::lockForUpdate()->find($data['auction_id']); // evita condiciones de carrera
        if (!$auction || !$auction->isActive()) {
            throw ValidationException::withMessages(['auction'=>'La subasta no está activa.']);
        }

        $amount = floatval($data['amount']);

        // Reglas: primera puja mínima 20€, la cuenta atrás empieza aquí
        if (floatval($auction->current_price) <= 0) {
            if ($amount < 20) {
                throw ValidationException::withMessages(['amount'=>'La primera puja debe ser de al menos 20€.']);
            }
            // Arranca temporizador si no existe end_at
            if (empty($auction->end_at)) {
                $auction->end_at = Carbon::now()->addMinutes($this->durationMinutes);
            }
        } else {
            // Para pujas posteriores: debe superar el current_price
            if ($amount <= floatval($auction->current_price)) {
                throw ValidationException::withMessages(['amount'=>'La puja debe ser superior al precio actual.']);
            }
        }

        // Guarda puja + actualiza precio actual
        $bid = Bid::create([
            'user_id'    => $req->user()->id,
            'auction_id' => $auction->id,
            'amount'     => $amount,
        ]);

        $auction->current_price = $amount;
        $auction->save();

        return response()->json([
            'ok' => true,
            'auction' => $auction->load('product.animal'),
            'bid' => $bid,
        ]);
    }
}
