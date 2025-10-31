<?php

namespace App\Http\Controllers;

use App\Models\Auction;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function toggle(Auction $auction, Request $request)
    {
        $user = $request->user();
        $exists = $user->favorites()->where('auction_id', $auction->id)->exists();

        if ($exists) {
            $user->favorites()->detach($auction->id);
            $state = false;
        } else {
            $user->favorites()->attach($auction->id);
            $state = true;
        }

        return response()->json(['favorite' => $state]);
    }

    public function list(Request $request)
    {
        $items = $request->user()->favorites()->with('product.animal')->latest('favorites.id')->get();
        return response()->json($items);
    }
}
