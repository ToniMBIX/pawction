<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Auction;
use App\Models\Product;
use App\Models\Animal;

class AuctionSeeder extends Seeder
{
    public function run(): void
    {
        if (Auction::count() > 0) return;

        // Crea un producto/animal genérico para asociar
        $animal = Animal::first() ?? Animal::create([
            'name' => 'Luna',
            'photo_url' => 'https://picsum.photos/seed/paw-animal/800/600',
            'status' => 'en_refugio',
        ]);

        $product = Product::first() ?? Product::create([
            'name' => 'Pack Llavero + Taza',
            'animal_id' => $animal->id,
        ]);

        $items = [
            ['title'=>'Pack Solidario 1','image_url'=>'https://picsum.photos/seed/paw1/800/600'],
            ['title'=>'Pack Solidario 2','image_url'=>'https://picsum.photos/seed/paw2/800/600'],
            ['title'=>'Pack Solidario 3','image_url'=>'https://picsum.photos/seed/paw3/800/600'],
        ];

        foreach ($items as $i) {
            Auction::create([
                'product_id'     => $product->id,
                'title'          => $i['title'],
                'description'    => 'Pack benéfico con QR del estado del animal adoptado.',
                'starting_price' => 20.00,
                'current_price'  => 0.00,
                'end_at'         => now()->addDays(7),
                'status'         => 'active',
                'image_url'      => $i['image_url'],
            ]);
        }
    }
}
