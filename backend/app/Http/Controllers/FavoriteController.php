<?php

namespace App\Http\Controllers;

use App\Models\Auction;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $user->load('favorites.product.animal');

        $favorites = $user->favorites
            ->map(function (Auction $auction) {
                return [
                    'id' => $auction->id,
                    'title' => $auction->title,
                    'description' => $auction->description,
                    'current_price' => $auction->current_price,
                    'starting_price' => $auction->starting_price,
                    'status' => $auction->status,
                    'image_url' => $auction->image_url,
                    'product' => $auction->product ? [
                        'animal' => $auction->product->animal ? [
                            'photo_url' => $auction->product->animal->photo_url,
                        ] : null,
                    ] : null,
                ];
            })
            ->values();

        return response()->json([
            'success' => true,
            'data' => $favorites,
        ]);
    }

    public function toggle(Request $request, Auction $auction)
    {
        $user = $request->user();

        $attached = $user->favorites()
            ->where('auction_id', $auction->id)
            ->exists();

        if ($attached) {
            $user->favorites()->detach($auction->id);

            return response()->json([
                'success' => true,
                'message' => 'Subasta eliminada de favoritos',
                'favorited' => false,
                'favorites_count' => $user->favorites()->count(),
            ]);
        }

        $user->favorites()->attach($auction->id);

        return response()->json([
            'success' => true,
            'message' => 'Subasta añadida a favoritos',
            'favorited' => true,
            'favorites_count' => $user->favorites()->count(),
        ], 201);
    }
}