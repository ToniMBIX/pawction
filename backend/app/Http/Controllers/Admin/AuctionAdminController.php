<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Models\{Auction, Product, Animal};

class AuctionAdminController extends Controller
{
    public function store(Request $req)
    {
        $data = $req->validate([
            'title'        => ['required','string','max:255'],
            'description'  => ['nullable','string'],
            'image_url'    => ['nullable','string'],
            'product_id'   => ['nullable','integer','exists:products,id'],
            'animal'       => ['nullable','array'],
            'animal.name'      => ['required_without:product_id','string','max:255'],
            'animal.species'   => ['nullable','string','max:100'],
            'animal.age'       => ['nullable','integer'],
            'animal.photo_url' => ['nullable','string'],
            'animal.info_url'  => ['nullable','string'],
        ]);

        // 1) Resolver product
        if (!empty($data['product_id'])) {
            $product = Product::find($data['product_id']);
        } else {
            // crear animal + product pack
            $animal = Animal::create([
                'name'        => $data['animal']['name'],
                'species'     => $data['animal']['species'] ?? 'Perro',
                'age'         => $data['animal']['age'] ?? null,
                'photo_url'   => $data['animal']['photo_url'] ?? null,
                'info_url'    => $data['animal']['info_url'] ?? null,
                'description' => 'Animal asociado al pack solidario',
            ]);

            $product = Product::create([
                'name'      => 'Pack taza + llavero',
                'animal_id' => $animal->id,
                // si usas image_url en products, puedes guardarla también aquí
            ]);
        }

        // 2) Crear la subasta con mínimo 20€ y fecha de fin a 7 días
        $auction = Auction::create([
            'product_id'     => $product->id,
            'title'          => $data['title'],
            'description'    => $data['description'] ?? null,
            'starting_price' => 20.00,
            'current_price'  => 20.00,
            'end_at'         => now()->addDays(7),
            'status'         => 'active',
            'payed'          => false,
            'image_url'      => $data['image_url'] ?? null,
        ]);

        // incluir relaciones para que el front tenga imagen/animal
        $auction->load('product.animal');

        return response()->json($auction, 201);
    }

    public function destroy(Auction $auction)
    {
        $auction->delete();
        return response()->noContent();
    }
}
