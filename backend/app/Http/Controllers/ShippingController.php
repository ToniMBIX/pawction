<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ShippingDetail;
use App\Models\Auction;

class ShippingController extends Controller
{
    public function submit(Request $request)
{
    $validated = $request->validate([
        'auction_id'   => 'required|exists:auctions,id',
        'full_name'    => 'required',
        'address'      => 'required',
        'city'         => 'required',
        'province'     => 'required',
        'country'      => 'required',
        'postal_code'  => 'required',
        'phone'        => 'required',
    ]);

    $auction = Auction::findOrFail($validated['auction_id']);

    // ⚠️ Quitamos auction_id de los datos a guardar
    $shippingData = collect($validated)
        ->except(['auction_id'])
        ->toArray();

    ShippingDetail::updateOrCreate(
        [
            'auction_id' => $auction->id,
            'user_id'    => auth()->id(),
        ],
        [
            ...$shippingData,
            'user_id' => auth()->id()
        ]
    );

    return response()->json([
        "success" => true,
        "message" => "Datos de envío guardados correctamente"
    ]);
}


    public function pending()
{
    $user = auth()->user();

    return Auction::where('winner_user_id', $user->id)
        ->where('status', 'finished')
        ->where('is_paid', false)
        ->get()
        ->map(function ($a) {
            return [
                'id' => $a->id,
                'title' => $a->title,
                'current_price' => $a->current_price,
                'paid_limit_at' => optional($a->paid_limit_at)->toIso8601String(),
                'pay_seconds_left' => $a->paid_limit_at
                    ? now()->diffInSeconds($a->paid_limit_at, false)
                    : null,
            ];
        });
}



}
