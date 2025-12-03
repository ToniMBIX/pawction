<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Auction;
use App\Models\ShippingDetail;
use App\Mail\OrderCompletedMail;
use Illuminate\Support\Facades\Mail;

class ShippingController extends Controller
{
    public function submit(Request $request)
    {
        $request->validate([
            "token" => "required",
            "full_name" => "required",
            "address" => "required",
            "city" => "required",
            "province" => "required",
            "postal_code" => "required",
            "phone" => "required",
        ]);

        $auction = Auction::where("shipping_token", $request->token)->firstOrFail();

        $shipping = ShippingDetail::create([
            "auction_id" => $auction->id,
            "user_id" => $auction->winner_id,
            "full_name" => $request->full_name,
            "address" => $request->address,
            "city" => $request->city,
            "province" => $request->province,
            "postal_code" => $request->postal_code,
            "phone" => $request->phone,
            "notes" => $request->notes ?? null,
        ]);

        // Eliminar token para que no pueda enviarse dos veces
        $auction->shipping_token = null;
        $auction->save();

        Mail::to($auction->winner->email)->send(
            new OrderCompletedMail($auction, $shipping)
        );

        return response()->json(["message" => "Datos de envío confirmados."]);
    }
}
