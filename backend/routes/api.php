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
use App\Http\Controllers\MyParticipatingAuctionsController;
use App\Http\Controllers\Admin\AuctionAdminController;

// ---------- Público ----------
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::get('/ping', fn () => response()->json([
    'success' => true,
    'message' => 'API funcionando',
]));

// Subastas públicas
Route::get('/auctions', [AuctionController::class, 'index']);
Route::get('/auctions/{auction}', [AuctionController::class, 'show']);
Route::get('/auctions/{auction}/qr', [AuctionController::class, 'qr']);

// ---------- Protegido ----------
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/me', [UserController::class, 'me']);
    Route::put('/me', [UserController::class, 'update']);

    Route::get('/me/summary', UserSummaryController::class);
    Route::get('/me/participating-auctions', MyParticipatingAuctionsController::class);

    Route::post('/bids', [BidController::class, 'store']);
    Route::get('/bids/mine', [BidController::class, 'mine']);

    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites/{auction}', [FavoriteController::class, 'toggle']);

    Route::get('/pending-orders', [ShippingController::class, 'pending']);
    Route::post('/shipping/submit', [ShippingController::class, 'submit']);

    Route::get('/payment/fake-start', [PaymentController::class, 'fakeStart']);
    Route::post('/payment/fake-complete', [PaymentController::class, 'fakeComplete']);
    Route::get('/payment/success', [PaymentController::class, 'paymentSuccess']);

    Route::post('/payment/stripe-checkout', [PaymentController::class, 'createStripeCheckout']);
Route::post('/payment/stripe-confirm', [PaymentController::class, 'confirmStripePayment']);
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

// ---------- Debug local ----------
Route::get('/debug/supabase-env', function () {
    return response()->json([
        'PAWCTION_STORAGE_URL' => env('PAWCTION_STORAGE_URL') ? 'OK' : 'MISSING',
        'PAWCTION_STORAGE_KEY' => env('PAWCTION_STORAGE_KEY') ? 'OK' : 'MISSING',
        'PAWCTION_STORAGE_BUCKET' => env('PAWCTION_STORAGE_BUCKET') ? 'OK' : 'MISSING',
        'key_length' => strlen((string) env('PAWCTION_STORAGE_KEY')),
        'bucket' => env('PAWCTION_STORAGE_BUCKET'),
    ]);
});
if (app()->environment('local')) {
    Route::get('/debug/auctions', fn () => response()->json([
        'success' => true,
        'data' => \App\Models\Auction::all(),
    ]));

    Route::middleware('auth:sanctum')->get('/debug/user', function (Request $request) {
        return response()->json([
            'success' => true,
            'user' => $request->user(),
        ]);
    });

    Route::middleware('auth:sanctum')->get('/debug/pending', function () {
        return response()->json([
            'success' => true,
            'data' => \App\Models\Auction::where('winner_user_id', auth()->id())
                ->where('is_paid', false)
                ->get(),
        ]);
    });
}

// ---------- Preflight ----------
Route::options('/{any}', fn () => response()->noContent())->where('any', '.*');