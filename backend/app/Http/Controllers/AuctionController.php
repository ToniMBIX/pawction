<?php

namespace App\Http\Controllers;

use App\Models\Auction;
use App\Models\Bid;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\PersonalAccessToken;

class AuctionController extends Controller
{
    protected function userFromToken(Request $request)
    {
        $token = $request->bearerToken();
        if (!$token) return null;

        $accessToken = PersonalAccessToken::findToken($token);
        return $accessToken ? $accessToken->tokenable : null;
    }

    /**
     * 🔄 AUTO-REABRIR SUBASTA SI HAN PASADO 5 MINUTOS SIN PAGO
     */
    protected function autoReopenIfExpired(Auction $auction)
    {
        if ($auction->status === 'finished' && !$auction->is_paid) {

            if ($auction->updated_at->diffInMinutes(now()) >= 5) {

                $auction->status = 'active';
                $auction->winner_user_id = null;
                $auction->current_price = 0;

                // Subasta vuelve a 1 minuto
                $auction->end_at = now()->addMinute();

                $auction->save();
            }
        }
    }

    /**
     * 📌 LISTADO DE SUBASTAS
     */
    public function index(Request $request)
    {
        $user = $this->userFromToken($request);

        $auctions = Auction::with('product.animal')
            ->orderBy('id', 'desc')
            ->paginate(20);

        $auctions->getCollection()->transform(function ($a) use ($user) {

            // ✔ AUTO-REABRIR
            $this->autoReopenIfExpired($a);

            // Recalcular contador
            $endsInSeconds = null;
            if ($a->end_at) {
                $now = Carbon::now();
                $endsInSeconds = $a->end_at->isFuture()
                    ? $now->diffInSeconds($a->end_at)
                    : 0;
            }

            $isFavorite = $user
                ? $user->favorites()->where('auction_id', $a->id)->exists()
                : false;

            return [
                'id'             => $a->id,
                'title'          => $a->title,
                'description'    => $a->description,
                'starting_price' => $a->starting_price,
                'current_price'  => $a->current_price,
                'status'         => $a->status,
                'image_url'      => $a->image_url,
                'document_url'   => $a->document_url,
                'qr_url'         => $a->qr_url,
                'end_at'         => optional($a->end_at)->toIso8601String(),
                'ends_in_seconds'=> $endsInSeconds,
                'is_favorite'    => $isFavorite,
                'product'        => $a->product ? [
                    'animal' => $a->product->animal ? [
                        'id'        => $a->product->animal->id,
                        'name'      => $a->product->animal->name,
                        'species'   => $a->product->animal->species,
                        'photo_url' => $a->product->animal->photo_url,
                        'info_url'  => $a->product->animal->info_url,
                    ] : null,
                ] : null,
            ];
        });

        return response()->json($auctions);
    }

    /**
     * 📌 SUBASTA INDIVIDUAL
     */
    public function show(Request $request, Auction $auction)
    {
        $auction->load('product.animal');

        // ⏳ CERRAR SI EL TIEMPO YA PASÓ
        if ($auction->status === 'active' && $auction->end_at && now()->greaterThanOrEqualTo($auction->end_at)) {

            $lastBid = Bid::where('auction_id', $auction->id)
                ->orderByDesc('amount')
                ->orderByDesc('id')
                ->first();

            $auction->status = 'finished';
            $auction->winner_user_id = $lastBid?->user_id;
            $auction->save();
        }

        // 🔄 AUTO-REABRIR DESPUÉS DE 5 MINUTOS
        $this->autoReopenIfExpired($auction);

        $user = $this->userFromToken($request);

        $isFavorite = $user
            ? $user->favorites()->where('auction_id', $auction->id)->exists()
            : false;

        // Contador
        $endsInSeconds = null;
        if ($auction->end_at) {
            $now = now();
            $endsInSeconds = $auction->end_at->isFuture()
                ? $now->diffInSeconds($auction->end_at)
                : 0;
        }

        return response()->json([
            'id'             => $auction->id,
            'title'          => $auction->title,
            'description'    => $auction->description,
            'starting_price' => $auction->starting_price,
            'current_price'  => $auction->current_price,
            'status'         => $auction->status,
            'image_url'      => $auction->image_url,
            'document_url'   => $auction->document_url,
            'qr_url'         => $auction->qr_url,
            'end_at'         => optional($auction->end_at)->toIso8601String(),
            'ends_in_seconds'=> $endsInSeconds,
            'is_favorite'    => $isFavorite,
            'product'        => $auction->product ? [
                'animal' => $auction->product->animal ? [
                    'id'        => $auction->product->animal->id,
                    'name'      => $auction->product->animal->name,
                    'species'   => $auction->product->animal->species,
                    'photo_url' => $auction->product->animal->photo_url,
                    'info_url'  => $auction->product->animal->info_url,
                ] : null,
            ] : null,
        ]);
    }

    public function qr(Auction $auction)
    {
        $auction->load('product.animal');

        if ($auction->product && $auction->product->animal && $auction->product->animal->info_url) {
            return redirect($auction->product->animal->info_url);
        }

        return response()->json(['message' => 'Este pack no tiene URL configurada.'], 404);
    }
}
