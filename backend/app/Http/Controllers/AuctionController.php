<?php

namespace App\Http\Controllers;

use App\Models\Auction;
use Illuminate\Http\Request;

class AuctionController extends Controller
{
    public function index(Request $req)
{
    $q = \App\Models\Auction::with(['product.animal'])
        ->orderByDesc('id');

    $res = $q->paginate(20);

    // Marca si es favorito del user
    $favIds = [];
    if ($req->user()) {
        $favIds = $req->user()->favorites()->pluck('auctions.id')->toArray();
    }

    $res->getCollection()->transform(function($a) use ($favIds){
        $a->is_favorite = in_array($a->id, $favIds);
        return $a;
    });

    return response()->json($res);
}

public function show(Request $req, \App\Models\Auction $auction)
{
    $auction->load('product.animal');

    $isFav = false;
    if ($req->user()) {
        $isFav = $req->user()->favorites()->where('auction_id',$auction->id)->exists();
    }

    return response()->json([
        'data' => $auction,
        'is_favorite' => $isFav,
    ]);
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
