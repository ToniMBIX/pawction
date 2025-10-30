<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{AuctionController,BidController,FavoriteController,PaymentController,WebhookController,UserController,AuthController};
use App\Support\BootstrapSeeder;
use App\Models\{Animal, Product, Auction};
use Illuminate\Support\Str;


// Public
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::get('/ping', fn() => response()->json(['ok' => true], 200));

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

Route::options('/{any}', fn() => response()->noContent())->where('any','.*');

use Illuminate\Support\Facades\Route;
use App\Models\{Animal, Product, Auction};
use Illuminate\Support\Str;

Route::get('/__seed', function () {
    // 1) Animal + Product base
    $animal = Animal::firstOrCreate(
        ['name' => 'Luna'],
        [
            'species' => 'Perro',
            'age' => 3,
            'description' => 'Cariñosa y juguetona',
            'photo_url' => 'https://picsum.photos/seed/luna/800/600',
            'info_url' => 'https://example.org/luna'
        ]
    );

    $product = Product::firstOrCreate(
        ['animal_id' => $animal->id, 'name' => 'Pack taza + llavero'],
        ['image_url' => 'https://picsum.photos/seed/pack/800/600']
    );

    // 2) Crea 3 subastas si no hay ninguna
    if (Auction::count() === 0) {
        $items = [
            ['title'=>'Pack solidario 1','image_url'=>'https://picsum.photos/seed/paw1/800/600'],
            ['title'=>'Pack solidario 2','image_url'=>'https://picsum.photos/seed/paw2/800/600'],
            ['title'=>'Pack solidario 3','image_url'=>'https://picsum.photos/seed/paw3/800/600'],
        ];
        foreach ($items as $i) {
            Auction::create([
                'product_id'      => $product->id,
                'title'           => $i['title'],
                'description'     => 'Pack taza + llavero con QR del estado de adopción.',
                'starting_price'  => 20.00,   // empieza en 20€
                'current_price'   => 0.00,    // el reloj arranca tras la 1ª puja
                'end_at'          => now()->addDays(7), // provisional para mostrar en UI
                'status'          => 'active',
                'payed'           => false,
                'image_url'       => $i['image_url'],
            ]);
        }
    }

    return response()->json([
        'status'   => 'seeded',
        'animals'  => Animal::count(),
        'products' => Product::count(),
        'auctions' => Auction::count(),
    ]);
});


Route::get('/__diag', function () {
    return response()->json([
        'counts' => [
            'animals'  => Animal::count(),
            'products' => Product::count(),
            'auctions' => Auction::count(),
        ],
        'first_auction' => Auction::with('product')->first(),
    ]);
});