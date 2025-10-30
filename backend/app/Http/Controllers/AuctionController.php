<?php

namespace App\Http\Controllers;

use App\Models\Auction;
use Illuminate\Http\Request;

class AuctionController extends Controller
{
    public function index(Request $request)
    {
        $q = Auction::with(['product.animal'])
            ->where('status', 'active')
            ->orderByDesc('id');

        return $q->paginate(12);
    }

    public function show(Auction $auction)
    {
        $auction->load(['product.animal']);
        return $auction;
    }

    public function qr(Auction $auction)
    {
        return response()->json([
            'auction_id' => $auction->id,
            'title'      => $auction->title,
            'status'     => $auction->status,
            'animal'     => optional($auction->product->animal)->only(['name','species','info_url']),
        ]);
    }
}
