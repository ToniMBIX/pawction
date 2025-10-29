<?php
namespace App\Http\Controllers;

use App\Models\{Auction, Product};
use Illuminate\Http\Request;
use App\Services\QrService;

class AuctionController extends Controller {
    public function index()
    {
          try {
            $q = Auction::query()
                ->when(Schema::hasColumn('auctions', 'status'), fn($qq) => $qq->where('status', 'active'))
                ->orderByDesc('id');

            if (Schema::hasTable('auction_images')) {
                $q->with('images');
            }

            return response()->json($q->get(), 200);
        } catch (\Throwable $e) {
            // Log interno y respuesta clara
            \Log::error('AUCTIONS_INDEX', ['e' => $e->getMessage()]);
            return response()->json(['message' => 'Cannot list auctions'], 500);
        }
    }
    public function show(Auction $auction){
        $auction->load('product.animal','bids.user');
        return response()->json($auction);
    }
    public function qr(Auction $auction, QrService $qr){
        $path = $qr->generateForAuction($auction);
        return response()->file($path);
    }
}
