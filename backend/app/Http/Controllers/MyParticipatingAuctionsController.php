<?php

namespace App\Http\Controllers;

use App\Models\Auction;
use Illuminate\Http\Request;

class MyParticipatingAuctionsController extends Controller
{
    public function __invoke(Request $request)
    {
        $userId = $request->user()->id;

        $auctions = Auction::with(['product.animal'])
            ->where('status', 'active')
            ->whereHas('bids', fn ($q) => $q->where('user_id', $userId))
            ->latest()
            ->take(10)
            ->get();

        return response()->json($auctions);
    }
}