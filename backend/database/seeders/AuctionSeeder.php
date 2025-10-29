<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Auction;

class AuctionSeeder extends Seeder
{
    public function run(): void
    {
        if (Auction::count() > 0) return;

        $items = [
            ['title'=>'Cesta solidaria 1','current_price'=>10,'image_url'=>'https://picsum.photos/seed/paw1/800/600'],
            ['title'=>'Cesta solidaria 2','current_price'=>20,'image_url'=>'https://picsum.photos/seed/paw2/800/600'],
            ['title'=>'Camiseta benéfica','current_price'=>15,'image_url'=>'https://picsum.photos/seed/paw3/800/600'],
        ];

        foreach ($items as $i) { Auction::create($i); }
    }
}
