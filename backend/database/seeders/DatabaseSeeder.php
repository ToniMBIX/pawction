<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\{Animal, Product};

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1) Animal base
        $animal = Animal::firstOrCreate(
            ['name' => 'Luna'], // clave "única" de conveniencia
            [
                'species'     => 'Perro',
                'age'         => 3,
                'description' => 'Cariñosa y juguetona',
                'photo_url'   => 'https://placekitten.com/500/300',
                'info_url'    => 'https://example.org/luna',
            ]
        );

        // 2) Producto que enlaza al animal
        $product = Product::firstOrCreate(
            ['name' => 'Pack taza + llavero'],
            ['animal_id' => $animal->id]
        );

        // 3) Seeders que dependen de que ya exista al menos 1 Product
        $this->call([
            AuctionSeeder::class,
            \Database\Seeders\AdminUserSeeder::class,
        ]);
    }
}
