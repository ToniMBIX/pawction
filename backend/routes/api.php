<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{
    AuctionController,BidController,FavoriteController,PaymentController,WebhookController,UserController,AuthController
};
use App\Models\{Animal, Product, Auction};
use Illuminate\Support\Str;
use App\Http\Controllers\Admin\AuctionAdminController;


// Auth públicas
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login',    [AuthController::class, 'login']);

Route::get('/ping', fn() => response()->json(['ok' => true], 200));

// Auctions públicas
Route::get('/auctions',              [AuctionController::class, 'index']);
Route::get('/auctions/{auction}',    [AuctionController::class, 'show']);
Route::get('/auctions/{auction}/qr', [AuctionController::class, 'qr']);

// Webhooks
Route::post('/webhooks/stripe', [WebhookController::class, 'stripe']);
Route::post('/webhooks/paypal', [WebhookController::class, 'paypal']);

// Protegidas
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/me',           [UserController::class, 'me']);
    Route::put('/me',           [UserController::class, 'update']);

    Route::post('/bids',        [BidController::class, 'store']);
    Route::post('/favorites/{auction}', [FavoriteController::class, 'toggle']);
    Route::post('/checkout/{auction}',  [PaymentController::class, 'checkout']);
});

// CORS preflight catch-all
Route::options('/{any}', fn() => response()->noContent())->where('any','.*');

// --- SOLO PARA POV / SEED SIN SHELL (borra después) ---
Route::get('/__seed', function () {
    if (Auction::count() > 0) {
        return response()->json(['seeded' => true, 'skipped' => 'auctions already exist']);
    }

    $animal = Animal::create([
        'name' => 'Luna',
        'species' => 'Perro',
        'age' => 3,
        'description' => 'Cariñosa y juguetona',
        'photo_url' => 'https://placekitten.com/800/500',
        'info_url' => 'https://example.org/luna'
    ]);

    $product = Product::create([
        'name' => 'Pack taza + llavero',
        'animal_id' => $animal->id
    ]);

    $items = [
        ['title'=>'Pack solidario 1','image_url'=>'https://picsum.photos/seed/paw1/800/600'],
        ['title'=>'Pack solidario 2','image_url'=>'https://picsum.photos/seed/paw2/800/600'],
        ['title'=>'Pack solidario 3','image_url'=>'https://picsum.photos/seed/paw3/800/600'],
    ];

    foreach ($items as $i) {
        Auction::create([
            'product_id'     => $product->id,
            'title'          => $i['title'],
            'description'    => 'Pack solidario (taza + llavero) con QR del animal.',
            'starting_price' => 20.00,     // mínimo 20€
            'current_price'  => 20.00,     // empieza mostrando 20€
            'end_at'         => now()->addDays(7),
            'status'         => 'active',
            'payed'          => false,
            'image_url'      => $i['image_url'],
        ]);
    }

    return response()->json(['seeded' => true, 'count' => Auction::count()]);
});

Route::middleware(['auth:sanctum','admin'])->prefix('admin')->group(function () {
    Route::post('/auctions', [AuctionAdminController::class, 'store']);
    Route::delete('/auctions/{auction}', [AuctionAdminController::class, 'destroy']);
});