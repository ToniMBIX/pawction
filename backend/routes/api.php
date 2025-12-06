<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{
  AuctionController, BidController, FavoriteController, PaymentController,
  WebhookController, UserController, AuthController, ShippingController
};
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use App\Http\Controllers\Admin\AuctionAdminController; // <-- IMPORTANTE

// ---------- Público ----------
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login',    [AuthController::class, 'login']);

Route::get('/ping', fn() => response()->json(['ok' => true], 200));

Route::get('/auctions',              [AuctionController::class, 'index']);
Route::get('/auctions/{auction}',    [AuctionController::class, 'show']);
Route::get('/auctions/{auction}/qr', [AuctionController::class, 'qr']);

// ---------- Protegido ----------
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/me',  [UserController::class, 'me']);
    Route::put('/me',  [UserController::class, 'update']);

    Route::post('/bids',                [BidController::class, 'store']);
    Route::post('/favorites/{auction}', [FavoriteController::class, 'toggle']);
    Route::post('/checkout/{auction}',  [PaymentController::class, 'checkout']);

    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::get('/bids/mine', [BidController::class, 'mine']);
    
Route::post('/payment/create-session', [PaymentController::class, 'createCheckoutSession']);
Route::get('/payment/success', [PaymentController::class, 'paymentSuccess']);

// Pendientes
Route::get('/pending-orders', [ShippingController::class, 'pending']);

// Guardar envío
Route::post('/shipping/submit', [ShippingController::class, 'submit']);

// Pasarela simulada
Route::get('/payment/fake-start', [PaymentController::class, 'fakeStart']);
Route::post('/payment/fake-complete', [PaymentController::class, 'fakeComplete']);
});

// ---------- ADMIN (protegido + admin) ----------
Route::middleware(['auth:sanctum', 'admin'])
    ->prefix('admin')
    ->group(function () {
        Route::get('/auctions',               [AuctionAdminController::class, 'index']);   // <-- ESTA ES LA QUE FALTA
        Route::post('/auctions',              [AuctionAdminController::class, 'store']);
        Route::delete('/auctions/{auction}',  [AuctionAdminController::class, 'destroy']);
    });


// Webhooks
Route::post('/webhooks/stripe', [WebhookController::class, 'stripe']);
Route::post('/webhooks/paypal', [WebhookController::class, 'paypal']);


// Preflight
Route::get('/auctions/{auction}/qr', function(\App\Models\Auction $auction) {
    return QrCode::size(200)->generate($auction->product->animal->info_url ?? 'https://pawction.org');
})->name('auction.qr');
Route::options('/{any}', fn() => response()->noContent())->where('any','.*');

Route::get('/debug/auctions', function () {
    return \App\Models\Auction::all();
});

Route::middleware('auth:sanctum')->get('/debug/user', function (Request $request) {
    return $request->user();
});

Route::middleware('auth:sanctum')->get('/debug/pending', function () {
    return \App\Models\Auction::where('winner_id', auth()->id())
        ->where('is_paid', false)
        ->get();
});
