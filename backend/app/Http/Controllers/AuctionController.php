<?php
namespace App\Http\Controllers;

use App\Models\{Auction, Product};
use Illuminate\Http\Request;
use App\Services\QrService;

class AuctionController extends Controller {
    public function index(Request $request)
    {
        try {
            // Selecciona sólo lo que usa el front; evita relaciones frágiles
            $q = Auction::query()
                ->select(['id','title','current_price','image_url','created_at'])
                ->latest();

            $auctions = $q->paginate(12);

            // Estructura compatible con tu front: { data: [...] }
            return response()->json($auctions, 200);

        } catch (\Throwable $e) {
            Log::error('AUCTIONS_INDEX_FAIL', [
                'm' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
            ]);

            // No caemos en 500: devolvemos lista vacía
            return response()->json([
                'data' => [],
                'message' => 'Auctions unavailable'
            ], 200);
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
