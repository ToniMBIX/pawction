<?php
namespace App\Http\Controllers;

use App\Models\{Auction, Product};
use Illuminate\Http\Request;
use App\Services\QrService;

class AuctionController extends Controller {
    public function index(Request $request)
    {
        $q = Auction::query()
    ->with(['product.animal:id,photo_url']) // para fallback
    ->select(['id','product_id','title','current_price','image_url','created_at'])
    ->latest();

$perPage = (int)($request->get('per_page', 12));
$page    = $q->paginate($perPage);

$items = $page->getCollection()->map(function ($a) {
    return [
        'id'            => $a->id,
        'title'         => $a->title,
        'current_price' => $a->current_price,
        'image_url'     => $a->image_url ?: ($a->product->animal->photo_url ?? null),
        'created_at'    => $a->created_at,
    ];
});

return response()->json([
    'data' => $items,
    'meta' => [
        'total'        => $page->total(),
        'current_page' => $page->currentPage(),
        'per_page'     => $page->perPage(),
        'last_page'    => $page->lastPage(),
    ]
]);

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
