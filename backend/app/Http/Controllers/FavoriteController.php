<?php

namespace App\Http\Controllers;

use App\Models\{Favorite, Auction};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FavoriteController extends Controller
{
    public function toggle(Auction $auction)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $fav = $user->favorites()->where('auction_id', $auction->id)->first();
        if ($fav) {
            $fav->delete();
            $status = 'removed';
        } else {
            $user->favorites()->create(['auction_id' => $auction->id]);
            $status = 'added';
        }

        return response()->json([
            'status' => $status,
            'favorites' => $user->favorites()->pluck('auction_id')
        ]);
    }
}
