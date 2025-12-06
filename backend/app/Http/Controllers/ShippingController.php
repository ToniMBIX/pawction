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
            'full_name'    => 'required|string|max:255',
            'address'      => 'required|string|max:255',
            'city'         => 'required|string|max:255',
            'province'     => 'required|string|max:255',   // 🔥 AÑADIDO
            'country'      => 'required|string|max:255',
            'postal_code'  => 'required|string|max:20',
            'phone'        => 'required|string|max:50',
        ]);

        $auction = Auction::findOrFail($validated['auction_id']);

        ShippingDetail::updateOrCreate(
            [
                'auction_id' => $auction->id,
                'user_id'    => auth()->id(), // 🔥 SE AGREGA CORRECTAMENTE
            ],
            [
                ...$validated,
                'user_id' => auth()->id(),     // 🔥 IMPORTANTE: en los datos a guardar
            ]
        );

        return response()->json([
            "success" => true,
            "message" => "Datos de envío guardados correctamente"
        ]);
    }

    public function pending()
    {
        return Auction::where('winner_user_id', auth()->id())
            ->where('is_paid', false)
            ->get();
    }
}
