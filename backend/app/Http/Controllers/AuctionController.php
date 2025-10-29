<?php
namespace App\Http\Controllers;

use App\Models\{Auction, Product};
use Illuminate\Http\Request;
use App\Services\QrService;

class AuctionController extends Controller {
    public function index(Request $request){
        $q = Auction::with('product.animal')->where('status','active')->orderBy('end_at')->paginate(12);
        if (Schema::hasTable('auction_images')) {
            $q->with('images');
        }
        return response()->json($q);
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
