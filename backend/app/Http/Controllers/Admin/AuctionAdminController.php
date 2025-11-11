<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{Auction, Product, Animal};
use Illuminate\Http\Request;

class AuctionAdminController extends Controller
{
    public function index()
    {
        $list = Auction::with('product.animal')
            ->orderByDesc('id')
            ->paginate(20);

        return response()->json($list);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'       => ['required','string','max:255'],
            'description' => ['nullable','string'],
            'image_url'   => ['nullable','string','max:2048'],
            'product_id'  => ['nullable','integer','exists:products,id'],

            // para crear animal+pack al vuelo
            'animal.name'      => ['nullable','string','max:255'],
            'animal.species'   => ['nullable','string','max:255'],
            'animal.age'       => ['nullable','integer'],
            'animal.photo_url' => ['nullable','string','max:2048'],
            'animal.info_url'  => ['nullable','string','max:2048'],
        ]);

        // producto
        if (!empty($data['product_id'])) {
            $productId = $data['product_id'];
        } else {
            if (empty($data['animal']['name'])) {
                return response()->json(['message'=>'Falta product_id o animal.name'], 422);
            }
            $animal = Animal::create([
                'name'      => $data['animal']['name'],
                'species'   => $data['animal']['species'] ?? 'Perro',
                'age'       => $data['animal']['age'] ?? null,
                'photo_url' => $data['animal']['photo_url'] ?? null,
                'info_url'  => $data['animal']['info_url'] ?? null,
            ]);
            $product = Product::create([
                'name'      => 'Pack taza + llavero',
                'animal_id' => $animal->id,
                'image_url' => $data['image_url'] ?? null,
            ]);
            $productId = $product->id;
        }

        $auction = Auction::create([
            'product_id'     => $productId,
            'title'          => $data['title'],
            'description'    => $data['description'] ?? null,
            'image_url'      => $data['image_url'] ?? null,
            'starting_price' => 20,
            'current_price'  => 0,          // arranca en 0; la primera puja será >= 20
            'status'         => 'active',
            'end_at'         => null,       // se inicia con la primera puja
        ]);

        return response()->json($auction->load('product.animal'), 201);
    }

    public function destroy(Auction $auction)
    {
        $auction->delete();
        return response()->json(['ok'=>true]);
    }
}
