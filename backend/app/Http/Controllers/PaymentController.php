<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Auction;
use App\Models\ShippingDetail;
use Illuminate\Support\Facades\Mail;

class PaymentController extends Controller
{
    public function fakeStart(Request $request)
    {
        $auction = Auction::findOrFail($request->auction_id);

        return response()->json([
            "auction" => $auction
        ]);
    }

    public function fakeComplete(Request $request)
    {
        $auction = Auction::findOrFail($request->auction_id);
        $shipping = ShippingDetail::where('auction_id', $auction->id)->first();

        $auction->is_paid = true;
        $auction->save();

        // Email al comprador
        Mail::raw(
            "Tu compra ha sido confirmada.\n\nDatos de envío:\n" .
            print_r($shipping->toArray(), true),
            function ($msg) use ($auction) {
                $msg->to($auction->winner_email)
                    ->subject("Confirmación de pago - Pawction");
            }
        );

        return response()->json([
            "success" => true
        ]);
    }
}
