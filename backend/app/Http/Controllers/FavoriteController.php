<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Auction;

class FavoriteController extends Controller
{
    /**
     * Devuelve las subastas favoritas del usuario autenticado.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Cargamos relaciones encadenadas para tener la foto del animal
        $user->load('favorites.product.animal');

        // Devolvemos SOLO la lista de subastas favoritas ya “normalizadas”
        $favorites = $user->favorites->map(function (Auction $a) {
            return [
                'id'            => $a->id,
                'title'         => $a->title,
                'current_price' => $a->current_price,
                'status'        => $a->status,
                'image_url'     => $a->image_url,
                'product'       => $a->product ? [
                    'animal' => $a->product->animal ? [
                        'photo_url' => $a->product->animal->photo_url,
                    ] : null,
                ] : null,
            ];
        })->values();

        return response()->json($favorites);
    }

    /**
     * Alterna una subasta como favorita / no favorita
     */
    public function toggle(Request $request, Auction $auction)
    {
        $user = $request->user();

        // ¿Ya está en favoritos?
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

        return response()->json([
            'favorited'        => $favorited,                     // <--- para el botón (Agregar/Quitar)
            'favorites_count'  => $user->favorites()->count(),    // opcional, por si quieres mostrar un contador
        ]);
    }
}
