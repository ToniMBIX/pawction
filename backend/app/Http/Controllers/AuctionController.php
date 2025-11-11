<?php

namespace App\Http\Controllers;

use App\Models\Auction;
use Illuminate\Http\Request;

class AuctionController extends Controller
{
    /**
     * Lista paginada de subastas activas.
     * Devuelve product.animal, marca is_favorite por item
     * y normaliza ends_in_seconds cuando no hay fin o ya venció.
     */
    public function index(Request $request)
    {
        $q = Auction::with(['product.animal'])
            ->where('status', 'active')
            ->orderByDesc('id');

        $res = $q->paginate(12);

        // Favoritos del usuario autenticado
        $user = $request->user();
        $favIds = [];
        if ($user) {
            // Ajusta si tu relación pivote usa otro nombre
            $favIds = $user->favorites()->pluck('auctions.id')->all();
        }

        $res->getCollection()->transform(function ($a) use ($favIds, $user) {
            // Flag para el frontend
            $a->is_favorite = $user ? in_array($a->id, $favIds) : false;

            // Normaliza contador en listado si no hay end_at o ya pasó
            if (is_null($a->end_at) || $a->end_at->isPast()) {
                $a->ends_in_seconds = 0;
            }

            return $a;
        });

        return response()->json($res);
    }

    /**
     * Detalle de subasta.
     * Si está vencida y aún activa, la cierra en este punto para coherencia.
     * Devuelve product.animal, bids.user, is_favorite y ends_in_seconds normalizado.
     */
    public function show(Request $request, Auction $auction)
    {
        $auction->load(['product.animal', 'bids.user']);

        // Si está activa pero la hora fin ya pasó, ciérrala y refresca
        if (
            $auction->status === 'active'
            && $auction->end_at
            && now()->greaterThanOrEqualTo($auction->end_at)
        ) {
            // closeNow fija winner_user_id según la puja más alta
            $auction->closeNow();
            $auction->refresh()->load(['product.animal', 'bids.user']);
        }

        // Marcar favorito para el usuario actual
        $user = $request->user();
        $isFav = false;
        if ($user) {
            $isFav = $user->favorites()->where('auctions.id', $auction->id)->exists();
        }
        $auction->is_favorite = $isFav;

        // Normaliza contador: si no hay end_at o ya venció => 0
        if (is_null($auction->end_at) || $auction->end_at->isPast()) {
            $auction->ends_in_seconds = 0;
        }

        return response()->json($auction);
    }

    /**
     * Información para QR (si lo usas)
     */
    public function qr(Auction $auction)
    {
        return response()->json([
            'auction_id' => $auction->id,
            'title'      => $auction->title,
            'status'     => $auction->status,
            'animal'     => optional($auction->product->animal)->only(['name', 'species', 'info_url']),
        ]);
    }
}
