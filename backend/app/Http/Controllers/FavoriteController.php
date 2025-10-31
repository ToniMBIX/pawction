<?php

namespace App\Http\Controllers;

use App\Models\Auction;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function toggle(Request $req, Auction $auction)
    {
        $user = $req->user();

        $isFav = $user->favorites()->where('auction_id',$auction->id)->exists();

        if ($isFav) {
            $user->favorites()->detach($auction->id);
            $isFav = false;
        } else {
            $user->favorites()->attach($auction->id);
            $isFav = true;
        }

        return response()->json([
            'favorited' => $isFav,
            'count' => $auction->favorites()->count(),
            'auction_id' => $auction->id,
        ]);
    }
}
