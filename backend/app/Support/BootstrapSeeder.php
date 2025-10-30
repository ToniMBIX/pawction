<?php

namespace App\Support;

use App\Models\{Animal, Product, Auction};
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;

class BootstrapSeeder
{
    const CACHE_KEY = 'bootstrap_seeded_v1';

    public static function run(): array
    {
        if (Cache::get(self::CACHE_KEY)) {
            return ['status' => 'already-seeded'];
        }

        if (!Schema::hasTable('auctions') || !Schema::hasTable('products') || !Schema::hasTable('animals')) {
            return ['status' => 'tables-missing'];
        }

        $animal = Animal::firstOrCreate(
            ['name' => 'Luna'],
            [
                'species'     => 'Perro',
                'age'         => 3,
                'description' => 'Cariñosa y juguetona',
                'photo_url'   => 'https://placekitten.com/500/300',
                'info_url'    => 'https://example.org/luna',
            ]
        );

        $product = Product::firstOrCreate(
            ['name' => 'Pack taza + llavero'],
            ['animal_id' => $animal->id]
        );

        $items = [
            ['t' => 'Pack taza + llavero · Edición 1', 'img' => 'https://picsum.photos/seed/paw1/800/600'],
            ['t' => 'Pack taza + llavero · Edición 2', 'img' => 'https://picsum.photos/seed/paw2/800/600'],
            ['t' => 'Pack taza + llavero · Edición 3', 'img' => 'https://picsum.photos/seed/paw3/800/600'],
        ];

        foreach ($items as $i) {
            Auction::firstOrCreate(
                ['title' => $i['t'], 'product_id' => $product->id],
                [
                    'description'    => 'Subasta solidaria (taza + llavero). El reloj empieza con la primera puja (mín. 20€).',
                    'starting_price' => 20.00,
                    'current_price'  => 0, // empieza en 0 hasta la primera puja de 20€
                    'end_at'         => Carbon::now()->addDays(7),
                    'status'         => 'active',
                    'payed'          => false,
                    'image_url'      => $i['img'],
                ]
            );
        }

        Cache::forever(self::CACHE_KEY, 1);
        return ['status' => 'seeded'];
    }
}
