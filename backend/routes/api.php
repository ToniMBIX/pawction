<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuctionController;
use App\Http\Controllers\BidController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\WebhookController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ShippingController;
use App\Http\Controllers\UserSummaryController;
use App\Http\Controllers\Admin\AuctionAdminController;
use App\Http\Controllers\MyParticipatingAuctionsController;

// ---------- Público ----------
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::get('/ping', fn () => response()->json(['ok' => true], 200));

Route::get('/auctions', [AuctionController::class, 'index']);
Route::get('/auctions/{auction}', [AuctionController::class, 'show']);
Route::get('/auctions/{auction}/qr', [AuctionController::class, 'qr']);

// ---------- Protegido ----------
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/me', [UserController::class, 'me']);
    Route::get('/me/summary', UserSummaryController::class);
    Route::put('/me', [UserController::class, 'update']);
    Route::get('/me/participating-auctions', MyParticipatingAuctionsController::class);

    Route::post('/bids', [BidController::class, 'store']);
    Route::get('/bids/mine', [BidController::class, 'mine']);

    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites/{auction}', [FavoriteController::class, 'toggle']);

    Route::post('/checkout/{auction}', [PaymentController::class, 'checkout']);
    Route::post('/payment/create-session', [PaymentController::class, 'createCheckoutSession']);
    Route::get('/payment/success', [PaymentController::class, 'paymentSuccess']);

    Route::get('/pending-orders', [ShippingController::class, 'pending']);
    Route::post('/shipping/submit', [ShippingController::class, 'submit']);

    Route::get('/payment/fake-start', [PaymentController::class, 'fakeStart']);
    Route::post('/payment/fake-complete', [PaymentController::class, 'fakeComplete']);
});

// ---------- ADMIN ----------
Route::middleware(['auth:sanctum', 'admin'])
    ->prefix('admin')
    ->group(function () {
        Route::get('/auctions', [AuctionAdminController::class, 'index']);
        Route::post('/auctions', [AuctionAdminController::class, 'store']);
        Route::delete('/auctions/{auction}', [AuctionAdminController::class, 'destroy']);
        Route::post('/auctions/{id}/close', [AuctionAdminController::class, 'close']);
        Route::post('/auctions/{id}/qr', [AuctionAdminController::class, 'uploadQr']);
    });

// ---------- Webhooks ----------
Route::post('/webhooks/stripe', [WebhookController::class, 'stripe']);
Route::post('/webhooks/paypal', [WebhookController::class, 'paypal']);

// ---------- Debug ----------
Route::get('/debug/auctions', fn () => \App\Models\Auction::all());

Route::middleware('auth:sanctum')->get('/debug/user', function (Request $request) {
    return $request->user();
});

Route::middleware('auth:sanctum')->get('/debug/pending', function () {
    return \App\Models\Auction::where('winner_user_id', auth()->id())
        ->where('is_paid', false)
        ->get();
});

// ---------- Preflight ----------
Route::options('/{any}', fn () => response()->noContent())->where('any', '.*');