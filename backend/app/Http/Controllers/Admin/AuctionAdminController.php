<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{Auction, Product, Animal};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage; // <-- AÑADE ESTO


class AuctionAdminController extends Controller
{
    public function index()
    {
        // Devuelve lista paginada con relaciones
        return Auction::with('product.animal')->orderByDesc('id')->paginate(20);
    }

   public function store(Request $request)
{
    $data = $request->validate([
        'title'       => ['required', 'string', 'max:255'],
        'description' => ['nullable', 'string'],
        'image'       => ['nullable', 'image', 'max:2048'],          // archivo
        'image_url'   => ['nullable', 'string', 'max:2048'],         // URL opcional
        'product_id'  => ['nullable', 'integer', 'exists:products,id'],

        'animal.name'      => ['nullable', 'string', 'max:255'],
        'animal.species'   => ['nullable', 'string', 'max:255'],
        'animal.age'       => ['nullable', 'integer'],
        'animal.photo_url' => ['nullable', 'string', 'max:2048'],
        'animal.info_url'  => ['nullable', 'string', 'max:2048'],
    ]);

    $productId = $data['product_id'] ?? null;

    if (!$productId && !empty($data['animal']['name'] ?? null)) {
        $animal = Animal::create([
            'name'      => $data['animal']['name'],
            'species'   => $data['animal']['species'] ?? 'Perro',
            'age'       => $data['animal']['age'] ?? null,
            'photo_url' => $data['animal']['photo_url'] ?? null,
            'info_url'  => $data['animal']['info_url'] ?? null,
        ]);

        $product = Product::create([
            'name'      => 'Pack taza + llavero ' . $animal->name,
            'animal_id' => $animal->id,
        ]);

        $productId = $product->id;
    }

    if (!$productId) {
        return response()->json([
            'message' => 'Debes indicar un product_id o los datos del animal',
        ], 422);
    }

    // Imagen: archivo tiene prioridad sobre image_url
    $imageUrl = $data['image_url'] ?? null;
    if ($request->hasFile('image')) {
        $path = $request->file('image')->store('auctions','public');
        $imageUrl = url('/storage/'.$path);

    }

    $auction = Auction::create([
        'product_id'     => $productId,
        'title'          => $data['title'],
        'description'    => $data['description'] ?? null,
        'image_url'      => $imageUrl,
        'starting_price' => 20,
        'current_price'  => 0,
        'status'         => 'active',
        'end_at'         => null,
    ]);

    return response()->json($auction->load('product.animal'), 201);
}


    public function destroy(Auction $auction)
    {
        $auction->delete();
        return response()->json(['ok' => true]);
    }
}
