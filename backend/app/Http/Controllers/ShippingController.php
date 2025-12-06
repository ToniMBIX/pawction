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
            'auction_id' => 'required|exists:auctions,id',
            'full_name' => 'required',
            'address' => 'required',
            'city' => 'required',
            'country' => 'required',
            'postal_code' => 'required',
            'phone' => 'required',
        ]);

        $auction = Auction::findOrFail($request->auction_id);

        ShippingDetail::updateOrCreate(
            [
                'auction_id' => $auction->id,
                'user_id' => auth()->id(),
            ],
            $validated
        );

        return response()->json([
            "success" => true,
            "message" => "Datos de envío guardados"
        ]);
    }

    public function pending()
    {
        return Auction::where('winner_id', auth()->id())
            ->where('is_paid', false)
            ->get();
    }
}
