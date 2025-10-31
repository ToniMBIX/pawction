<?php

namespace App\Http\Controllers;

use App\Models\Auction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuctionController extends Controller
{
    public function index(Request $request)
    {
        $q = Auction::with(['product.animal'])
            ->where('status','active')
            ->orderByDesc('id');

        $res = $q->paginate(12);

        // Marca is_favorite por item si hay user
        if ($user = Auth::user()) {
            $favIds = $user->favorites()->pluck('auctions.id')->all();
            $res->getCollection()->transform(function($a) use ($favIds){
                $a->is_favorite = in_array($a->id, $favIds);
                return $a;
            });
        }

        return response()->json($res);
    }

    public function show(Auction $auction)
    {
        $auction->load(['product.animal','bids.user']);
        $auction->is_favorite = Auth::check() ? Auth::user()->hasFavorited($auction->id) : false;
        return response()->json($auction);
    }

    // QR si lo usas
    public function qr(Auction $auction)
    {
        return response()->json([
            'auction_id' => $auction->id,
            'title'      => $auction->title,
            'status'     => $auction->status,
            'animal'     => optional($auction->product->animal)->only(['name','species','info_url'])
        ]);
    }
}
