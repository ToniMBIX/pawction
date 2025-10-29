<?php
namespace App\Http\Controllers;

use App\Models\{Auction, Product};
use Illuminate\Http\Request;
use App\Services\QrService;

class AuctionController extends Controller {
    public function index()
    {
        $q = Auction::query()
            ->where('status','active')
            ->orderByDesc('id');

        if (Schema::hasTable('auction_images')) {
            $q->with('images');
        }

        return response()->json($q->get(), 200);
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
