<?php

namespace App\Http\Controllers;

use App\Models\Auction;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function toggle(Request $request, Auction $auction)
    {
        $user = $request->user();

        $exists = $user->favoriteAuctions()->where('auction_id', $auction->id)->exists();
        if ($exists) {
            $user->favoriteAuctions()->detach($auction->id);
            $state = false;
        } else {
            $user->favoriteAuctions()->attach($auction->id);
            $state = true;
        }

        return response()->json(['favorite' => $state]);
    }
}
