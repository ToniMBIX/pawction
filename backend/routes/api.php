<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\{
  AuctionController, BidController, FavoriteController, PaymentController,
  WebhookController, UserController, AuthController
};
use App\Http\Controllers\Admin\AuctionAdminController;
use App\Models\{Animal, Product, Auction};
use Illuminate\Support\Str;

/**
 * Auth públicas
 */
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login',    [AuthController::class, 'login']);

/**
 * Rutas que requieren auth (Sanctum)
 */
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', function(Request $request){
        /** @var \App\Models\User $u */
        $u = $request->user();
        $favorites = $u->favorites()->pluck('auctions.id')->values();
        return [
            'id'        => $u->id,
            'name'      => $u->name,
            'email'     => $u->email,
            'is_admin'  => (bool)($u->is_admin ?? false),
            'favorites' => $favorites,
        ];
    });

    // Pujar
    Route::post('/auctions/{auction}/bids', [BidController::class, 'store']);

    // Favoritos
    Route::post('/auctions/{auction}/favorite', [FavoriteController::class, 'toggle']);

    // Checkout del ganador (Stripe PaymentIntent)
    Route::post('/checkout/{auction}', [PaymentController::class, 'checkout']);
});

/**
 * Rutas públicas de subastas/catálogo
 */
Route::get('/auctions', [AuctionController::class, 'index']);
Route::get('/auctions/{auction}', [AuctionController::class, 'show']);
Route::get('/auctions/{auction}/qr', [AuctionController::class, 'qr']);

/**
 * Webhooks de pago
 */
Route::post('/webhooks/stripe', [WebhookController::class, 'stripe']);
Route::post('/webhooks/paypal', [WebhookController::class, 'paypal']);

/**
 * Admin (protegido por auth + middleware admin)
 */
Route::middleware(['auth:sanctum','admin'])->prefix('admin')->group(function () {
    Route::get('/auctions', [AuctionAdminController::class, 'index']);
    Route::post('/auctions', [AuctionAdminController::class, 'store']);
    Route::put('/auctions/{auction}', [AuctionAdminController::class, 'update']);
    Route::patch('/auctions/{auction}/status', [AuctionAdminController::class, 'updateStatus']);
    Route::delete('/auctions/{auction}', [AuctionAdminController::class, 'destroy']);
});

/**
 * Seed rápido (SOLO para desarrollo)
 */
Route::post('/dev/seed', function(){
    if (!app()->environment(['local','development'])) {
        abort(403, 'Solo en desarrollo');
    }

    // Crea animales, productos y subastas de ejemplo
    $animals = [
        ['name'=>'Luna','species'=>'Perro','info_url'=>'https://example.com/luna','image_url'=>'https://picsum.photos/seed/luna/800/600'],
        ['name'=>'Milo','species'=>'Gato','info_url'=>'https://example.com/milo','image_url'=>'https://picsum.photos/seed/milo/800/600'],
        ['name'=>'Kira','species'=>'Perro','info_url'=>'https://example.com/kira','image_url'=>'https://picsum.photos/seed/kira/800/600'],
    ];

    foreach ($animals as $i) {
        $animal = Animal::create([
            'name' => $i['name'],
            'species' => $i['species'],
            'info_url' => $i['info_url'],
            'image_url' => $i['image_url'],
        ]);

        $product = Product::create([
            'animal_id' => $animal->id,
            'name' => 'Pack taza + llavero ' . $animal->name,
            'sku'  => Str::uuid(),
            'qr_code' => null, // lo genera QrService al crear PDF
        ]);

        Auction::create([
            'product_id'     => $product->id,
            'title'          => 'Subasta solidaria: ' . $animal->name,
            'description'    => 'Pack solidario con la imagen de ' . $animal->name,
            'starting_price' => 20.00,
            'current_price'  => 0,
            'end_at'         => now()->addDays(3),
            'status'         => 'active',
            'payed'          => false,
            'image_url'      => $i['image_url'],
        ]);
    }

    return response()->json(['seeded' => true, 'count' => Auction::count()]);
});
