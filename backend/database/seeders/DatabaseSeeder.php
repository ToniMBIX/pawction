<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\{Animal, Product};

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
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

        Product::firstOrCreate(
            ['name' => 'Pack taza + llavero'],
            ['animal_id' => $animal->id]
        );

        $this->call([
            AuctionSeeder::class,
            \Database\Seeders\AdminUserSeeder::class,
        ]);

    }
}
