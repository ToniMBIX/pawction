<?php
namespace App\Http\Controllers;

use App\Models\{Auction, Product};
use Illuminate\Http\Request;
use App\Services\QrService;

class AuctionController extends Controller {
   public function index()
{
    $q = \App\Models\Auction::with(['product.animal'])
        ->where('status', 'active')
        ->orderByDesc('id');

    return response()->json($q->paginate(12));
}

    public function show(\App\Models\Auction $auction)
{
    $auction->load(['product.animal']);
    return response()->json($auction);
}

    public function qr(Auction $auction, QrService $qr){
        $path = $qr->generateForAuction($auction);
        return response()->file($path);
    }
    public function logout(Request $request)
{
    try {
        $token = $request->user()?->currentAccessToken();
        if ($token) {
            $token->delete();
        }
        return response()->json(['ok' => true], 200);
    } catch (\Throwable $e) {
        \Log::error('LOGOUT_FAIL', ['m' => $e->getMessage()]);
        // No rompas la UI por un logout sin token
        return response()->json(['ok' => true], 200);
    }
}

}
