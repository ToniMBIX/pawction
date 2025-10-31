<?php

namespace App\Http\Controllers;

use App\Models\Auction;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function toggle(Request $request, Auction $auction)
    {
        $user = $request->user();

        $attached = $user->favorites()
            ->where('auction_id', $auction->id)
            ->exists();

        if ($attached) {
            $user->favorites()->detach($auction->id);
            $favorited = false;
        } else {
            $user->favorites()->attach($auction->id);
            $favorited = true;
        }

        // Opcionalmente refresca la lista
        $user->load('favorites');

        return response()->json([
            'favorited' => $favorited,
            'favorites_count' => $user->favorites()->count(),
        ]);
    }
}
