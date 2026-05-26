<?php

namespace App\Http\Controllers;

use App\Models\Auction;
use Illuminate\Http\Request;

class UserSummaryController extends Controller
{
    public function __invoke(Request $request)
    {
        $userId = $request->user()->id;

        $activeParticipatingCount = Auction::where('status', 'active')
            ->whereHas('bids', fn ($q) => $q->where('user_id', $userId))
            ->distinct()
            ->count('auctions.id');

        $pendingWonCount = Auction::where('winner_user_id', $userId)
            ->where('status', 'finished')
            ->where(function ($q) {
                $q->where('is_paid', false)
                    ->orWhereNull('is_paid');
            })
            ->where(function ($q) {
                $q->whereNull('paid_limit_at')
                    ->orWhere('paid_limit_at', '>', now());
            })
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'active_participating_count' => $activeParticipatingCount,
                'pending_won_count' => $pendingWonCount,
            ],
        ]);
    }
}