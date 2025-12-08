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
    return Auction::where('is_paid', false)
        ->whereIn('id', function ($q) {
            $q->select('auction_id')
              ->from('bids')
              ->where('user_id', auth()->id());
        })
        ->get();
}

}
