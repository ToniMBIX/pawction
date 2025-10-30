<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\{Auction,Bid};
use App\Jobs\CloseAuctionJob;
use Carbon\Carbon;

class BidController extends Controller {
    public function store(Request $request)
{
    $data = $request->validate([
        'auction_id' => 'required|exists:auctions,id',
        'amount'     => 'required|numeric|min:0',
    ]);

    $auction = \App\Models\Auction::lockForUpdate()->findOrFail($data['auction_id']);
    if ($auction->status !== 'active') {
        return response()->json(['message' => 'La subasta no está activa'], 422);
    }

    $amount = (float) $data['amount'];

    // Si es la primera puja (precio actual == 0), debe ser >= 20
    if ((float)$auction->current_price <= 0 && $amount < 20) {
        return response()->json(['message' => 'La primera puja debe ser de al menos 20 €'], 422);
    }

    // A partir de ahí, debe superar el precio actual
    if ($amount <= (float)$auction->current_price) {
        return response()->json(['message' => 'La puja debe superar el precio actual'], 422);
    }

    // Si es la primera puja, arranca la cuenta atrás (ej. 7 días)
    if ((float)$auction->current_price <= 0) {
        // Solo si quieres re-calcular el fin al arrancar:
        $auction->end_at = now()->addDays(7);
    }

    $auction->current_price = $amount;
    $auction->save();

    // Guarda el bid si tienes el modelo Bid
    // Bid::create([...]);

    return response()->json([
        'message' => 'Puja aceptada',
        'auction' => $auction->fresh(['product.animal']),
    ]);
}

}
