<?php

namespace App\Http\Controllers;

use App\Models\Auction;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function toggle(Request $req, Auction $auction)
    {
        $user = $req->user();

        $exists = $user->favorites()->where('auction_id',$auction->id)->exists();

        if ($exists) {
            $user->favorites()->detach($auction->id);
            $favorited = false;
        } else {
            $user->favorites()->attach($auction->id);
            $favorited = true;
        }

        $count = $auction->favorites()->count();

        return response()->json([
            'favorited' => $favorited,
            'count' => $count,
            'auction_id' => $auction->id,
        ]);
    }
}
