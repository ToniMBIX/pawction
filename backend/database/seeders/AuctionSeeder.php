<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\{Auction, Product, Animal};

class AuctionSeeder extends Seeder
{
    public function run(): void
    {
        if (Auction::count() > 0) return;

        $animal = Animal::first() ?? Animal::create([
            'name'=>'Luna','species'=>'Perro','age'=>3,
            'description'=>'Cariñosa y juguetona','photo_url'=>'https://placekitten.com/800/500',
            'info_url'=>'https://example.org/luna'
        ]);
        $product = Product::first() ?? Product::create([
            'name'=>'Pack taza + llavero','animal_id'=>$animal->id
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
                'starting_price' => 20.00,
                'current_price'  => 20.00,
                'end_at'         => now()->addDays(7),
                'status'         => 'active',
                'payed'          => false,
                'image_url'      => $i['image_url'],
            ]);
        }
    }
}
