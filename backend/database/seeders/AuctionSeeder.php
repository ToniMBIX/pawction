<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\{Product, Auction};
use Illuminate\Support\Carbon;

class AuctionSeeder extends Seeder
{
    public function run(): void
    {
        if (Auction::count() > 0) return;

        $product = Product::first();     // ya existe por DatabaseSeeder
        if (!$product) return;

        $items = [
            [
                'title'          => 'Pack taza + llavero · Edición 1',
                'image_url'      => 'https://picsum.photos/seed/paw1/800/600',
            ],
            [
                'title'          => 'Pack taza + llavero · Edición 2',
                'image_url'      => 'https://picsum.photos/seed/paw2/800/600',
            ],
            [
                'title'          => 'Pack taza + llavero · Edición 3',
                'image_url'      => 'https://picsum.photos/seed/paw3/800/600',
            ],
        ];

        foreach ($items as $i) {
            Auction::create([
                'product_id'     => $product->id,
                'title'          => $i['title'],
                'description'    => 'Subasta solidaria del pack (taza + llavero). La cuenta atrás empieza al alcanzar 20€.',
                'starting_price' => 20.00,
                'current_price'  => 20.00,               // hasta la primera puja
                'end_at'         => Carbon::now()->addDays(7),
                'status'         => 'active',
                'payed'          => false,
                'image_url'      => $i['image_url'],
            ]);
        }
    }
}
