<?php

namespace App\Http\Controllers;

use App\Models\Auction;

class AuctionController extends Controller
{
    public function index()
    {
        $q = Auction::query()
            ->with(['product.animal'])
            ->orderByDesc('created_at');

        // NO filtres por current_price > 0 (el reloj arranca con la 1ª puja)
        return response()->json($q->paginate(12));
    }

    public function show(Auction $auction)
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
