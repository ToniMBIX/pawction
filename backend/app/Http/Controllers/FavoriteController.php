<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Auction;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $user->load('favorites.product.animal');

        // Devolvemos solo la lista de favoritos (array de subastas)
        return response()->json($user->favorites->map(function ($a) {
            return [
                'id'            => $a->id,
                'title'         => $a->title,
                'current_price' => $a->current_price,
                'status'        => $a->status,
                'image_url'     => $a->image_url,
                'product'       => $a->product ? [
                    'animal' => $a->product->animal ? [
                        'photo_url' => $a->product->animal->photo_url,
                    ] : null
                ] : null,
            ];
        })->values());
    }

    public function toggle(Request $request, Auction $auction)
    {
        $user = $request->user();

        $attached = $user->favorites()->where('auction_id', $auction->id)->exists();

        if ($attached) {
            $user->favorites()->detach($auction->id);
            $favorited = false;
        } else {
            $user->favorites()->attach($auction->id);
            $favorited = true;
        }

        return response()->json([
            'favorited' => $favorited,
            'favorites_count' => $user->favorites()->count(),
        ]);
    }
}
