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

        if (!$token) {
            return null;
        }

        $accessToken = PersonalAccessToken::findToken($token);

        return $accessToken
            ? $accessToken->tokenable
            : null;
    }

    /**
     * 🔄 REABRIR SI EL GANADOR NO PAGA
     */
    protected function autoReopenIfExpired(Auction $auction): void
    {
        if (
            $auction->status === 'finished' &&
            !$auction->is_paid &&
            $auction->winner_user_id !== null &&
            $auction->paid_limit_at !== null &&
            now()->greaterThanOrEqualTo($auction->paid_limit_at)
        ) {
            $auction->status = 'active';
            $auction->winner_user_id = null;
            $auction->current_price = 0;
            $auction->end_at = null;
            $auction->paid_limit_at = null;

            $auction->save();
        }
    }

    /**
     * ⏳ CERRAR SI TERMINÓ EL TIEMPO
     */
    protected function autoCloseIfExpired(Auction $auction): void
    {
        if (
            $auction->status !== 'active' ||
            !$auction->end_at ||
            now()->lt($auction->end_at)
        ) {
            return;
        }

        $lastBid = Bid::where('auction_id', $auction->id)
            ->orderByDesc('amount')
            ->orderByDesc('id')
            ->first();

        if ($lastBid) {
            $auction->status = 'finished';
            $auction->winner_user_id = $lastBid->user_id;
            $auction->paid_limit_at = now()->addMinutes(5);

            $auction->save();

            return;
        }

        // NO HUBO PUJAS → RESET
        $auction->status = 'active';
        $auction->winner_user_id = null;
        $auction->end_at = null;

        $auction->save();
    }

    /**
     * 📦 SERIALIZADOR
     */
    protected function serializeAuction(Auction $auction, $user = null): array
    {
        $this->autoCloseIfExpired($auction);
        $this->autoReopenIfExpired($auction);

        $auction->refresh()->loadMissing('product.animal');

        $endsInSeconds = null;

        if ($auction->end_at) {
            $endsInSeconds = $auction->end_at->isFuture()
                ? now()->diffInSeconds($auction->end_at)
                : 0;
        }

        $isFavorite = false;

        if ($user) {
            $isFavorite = $user
                ->favorites()
                ->where('auction_id', $auction->id)
                ->exists();
        }

        return [
            'id' => $auction->id,
            'title' => $auction->title,
            'description' => $auction->description,
            'starting_price' => $auction->starting_price,
            'current_price' => $auction->current_price,
            'status' => $auction->status,
            'winner_user_id' => $auction->winner_user_id,
            'image_url' => $auction->image_url,
            'document_url' => $auction->document_url,
            'qr_url' => $auction->qr_url,
            'is_paid' => (bool) $auction->is_paid,
            'end_at' => optional($auction->end_at)->toIso8601String(),
            'paid_limit_at' => optional($auction->paid_limit_at)->toIso8601String(),
            'ends_in_seconds' => $endsInSeconds,
            'is_favorite' => $isFavorite,

            'product' => $auction->product ? [
                'id' => $auction->product->id,

                'animal' => $auction->product->animal ? [
                    'id' => $auction->product->animal->id,
                    'name' => $auction->product->animal->name,
                    'species' => $auction->product->animal->species,
                    'photo_url' => $auction->product->animal->photo_url,
                    'info_url' => $auction->product->animal->info_url,
                ] : null,
            ] : null,
        ];
    }

    /**
     * 📌 LISTADO
     */
    public function index(Request $request)
    {
        $user = $this->userFromToken($request);

        $auctions = Auction::with('product.animal')
            ->orderByDesc('id')
            ->paginate(20);

        $auctions->getCollection()->transform(function ($auction) use ($user) {
            return $this->serializeAuction($auction, $user);
        });

        return response()->json([
            'success' => true,
            'data' => $auctions,
        ]);
    }

    /**
     * 📌 DETALLE
     */
    public function show(Request $request, Auction $auction)
    {
        $auction->load('product.animal');

        $user = $this->userFromToken($request);

        return response()->json([
            'success' => true,
            'data' => $this->serializeAuction($auction, $user),
        ]);
    }

    /**
     * 🔗 QR REDIRECT
     */
    public function qr(Auction $auction)
    {
        $auction->load('product.animal');

        if (
            $auction->product &&
            $auction->product->animal &&
            $auction->product->animal->info_url
        ) {
            return redirect($auction->product->animal->info_url);
        }

        return response()->json([
            'success' => false,
            'message' => 'Este pack no tiene URL configurada.',
        ], 404);
    }
}