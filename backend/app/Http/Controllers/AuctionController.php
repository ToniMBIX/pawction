<?php

namespace App\Http\Controllers;

use App\Models\Auction;

class AuctionController extends Controller
{
    public function index()
    {
        return response()->json(
            \App\Models\Auction::with(['product.animal'])
                ->orderByDesc('created_at')
                ->paginate(12)
        );
    }


    public function show(\App\Models\Auction $auction)
    {
        $auction->load(['product.animal']);
        return response()->json($auction);
    }


    public function qr(Auction $auction)
    {
        return response()->json([
            'id'      => $auction->id,
            'title'   => $auction->title,
            'status'  => $auction->status,
            'animal'  => optional($auction->product->animal)->only(['name','species','photo_url','info_url']),
            'price'   => $auction->current_price,
        ]);
    }
}
