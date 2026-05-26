<?php

namespace App\Http\Controllers;

use App\Models\Auction;
use App\Models\ShippingDetail;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ShippingController extends Controller
{
    public function submit(Request $request)
    {
        $validated = $request->validate([
            'auction_id' => ['required', 'exists:auctions,id'],
            'full_name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:120'],
            'province' => ['required', 'string', 'max:120'],
            'country' => ['required', 'string', 'max:120'],
            'postal_code' => ['required', 'string', 'max:20'],
            'phone' => ['required', 'string', 'max:30'],
        ]);

        $user = $request->user();

        $auction = Auction::findOrFail($validated['auction_id']);

        if ((int) $auction->winner_user_id !== (int) $user->id) {
            throw ValidationException::withMessages([
                'auction_id' => ['No puedes completar el envío de una subasta que no has ganado.'],
            ]);
        }

        if ($auction->status !== 'finished') {
            throw ValidationException::withMessages([
                'auction_id' => ['Esta subasta todavía no ha finalizado.'],
            ]);
        }

        if ($auction->is_paid) {
            throw ValidationException::withMessages([
                'auction_id' => ['Esta subasta ya está pagada.'],
            ]);
        }

        if ($auction->paid_limit_at && now()->greaterThanOrEqualTo($auction->paid_limit_at)) {
            throw ValidationException::withMessages([
                'auction_id' => ['El plazo para pagar esta subasta ha expirado.'],
            ]);
        }

        $shippingData = collect($validated)
            ->except(['auction_id'])
            ->toArray();

        $shipping = ShippingDetail::updateOrCreate(
            [
                'auction_id' => $auction->id,
                'user_id' => $user->id,
            ],
            [
                ...$shippingData,
                'user_id' => $user->id,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Datos de envío guardados correctamente',
            'shipping' => $shipping,
        ]);
    }

    public function pending(Request $request)
    {
        $user = $request->user();

        $auctions = Auction::where('winner_user_id', $user->id)
            ->where('status', 'finished')
            ->where('is_paid', false)
            ->where(function ($query) {
                $query
                    ->whereNull('paid_limit_at')
                    ->orWhere('paid_limit_at', '>', now());
            })
            ->orderBy('paid_limit_at')
            ->get()
            ->map(function ($auction) {
                return [
                    'id' => $auction->id,
                    'title' => $auction->title,
                    'current_price' => $auction->current_price,
                    'paid_limit_at' => optional($auction->paid_limit_at)->toIso8601String(),
                    'pay_seconds_left' => $auction->paid_limit_at
                        ? max(0, now()->diffInSeconds($auction->paid_limit_at, false))
                        : null,
                ];
            })
            ->values();

        return response()->json([
            'success' => true,
            'data' => $auctions,
        ]);
    }
}