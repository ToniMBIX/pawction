<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{AuctionController,BidController,FavoriteController,PaymentController,WebhookController,UserController,AuthController};

// Public
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::get('/auctions', [AuctionController::class, 'index']);
Route::get('/auctions/{auction}', [AuctionController::class, 'show']);
Route::get('/auctions/{auction}/qr', [AuctionController::class, 'qr']);

// Webhooks
Route::post('/webhooks/stripe', [WebhookController::class, 'stripe']);
Route::post('/webhooks/paypal', [WebhookController::class, 'paypal']);

// Protected
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/me', [UserController::class, 'me']);
    Route::put('/me', [UserController::class, 'update']);

    Route::post('/bids', [BidController::class, 'store']);
    Route::post('/favorites/{auction}', [FavoriteController::class, 'toggle']);
    Route::post('/checkout/{auction}', [PaymentController::class, 'checkout']);
});
