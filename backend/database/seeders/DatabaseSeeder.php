<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\{Animal,Product,Auction};

class DatabaseSeeder extends Seeder {
    public function run(){
        $this->call(\Database\Seeders\AuctionSeeder::class);
        $this->call(\Database\Seeders\AdminUserSeeder::class);
        $animal = Animal::create([
            'name'=>'Luna','species'=>'Perro','age'=>3,
            'description'=>'Cariñosa y juguetona','photo_url'=>'https://placekitten.com/500/300',
            'info_url'=>'https://example.org/luna'
        ]);
        $product = Product::create(['name'=>'Pack taza + llavero','animal_id'=>$animal->id]);
        Auction::create([
            'product_id'=>$product->id,
            'title'=>'Pack Luna edición solidaria',
            'description'=>'Con código QR del animal adoptado',
            'starting_price'=>10.00,
            'current_price'=>10.00,
            'end_at'=>now()->addDay(),
            'status'=>'active'
        ]);
    }
}
