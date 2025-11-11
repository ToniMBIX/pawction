<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{Auction, Product, Animal};
use Illuminate\Http\Request;

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
            'title'       => ['required','string','max:255'],
            'description' => ['nullable','string'],
            'image_url'   => ['nullable','string','max:2048'],
            'product_id'  => ['nullable','integer','exists:products,id'],

            'animal.name'      => ['nullable','string','max:255'],
            'animal.species'   => ['nullable','string','max:255'],
            'animal.age'       => ['nullable','integer'],
            'animal.photo_url' => ['nullable','string','max:2048'],
            'animal.info_url'  => ['nullable','string','max:2048'],
        ]);

        // Si no viene product_id y sí datos de animal, creamos el pack al vuelo
        if (empty($data['product_id']) && !empty($data['animal']['name'])) {
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
            ]);
            $data['product_id'] = $product->id;
        }

        $auction = Auction::create([
            'product_id'     => $data['product_id'],
            'title'          => $data['title'],
            'description'    => $data['description'] ?? null,
            'image_url'      => $data['image_url'] ?? null,
            'starting_price' => 20,     // requisito
            'current_price'  => 0,      // hasta primera puja
            'end_at'         => null,   // se inicia con la primera puja
            'status'         => 'active',
        ]);

        return response()->json(
            Auction::with('product.animal')->findOrFail($auction->id),
            201
        );
    }

    public function destroy(Auction $auction)
    {
        $auction->delete();
        return response()->json(['ok' => true]);
    }
}
