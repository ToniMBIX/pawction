<?php

use App\Models\Animal;
use App\Models\Product;
use App\Models\Auction;
use App\Models\Bid;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class WonAuctionSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::find(1);

        if (!$user) {
            $this->command->error('No existe el usuario con ID 1');
            return;
        }

        $animal = Animal::create([
            'name' => 'Tortuga marina',
            'species' => 'Caretta caretta',
            'photo_url' => 'https://placehold.co/600x400?text=Tortuga+marina',
            'info_url' => 'https://www.greenpeace.org/',
        ]);

        $product = Product::create([
            'animal_id' => $animal->id,
            'name' => 'Pack solidario Tortuga marina',
            'description' => 'Pack benéfico ganado por el usuario de prueba.',
        ]);

        $auction = Auction::create([
            'product_id' => $product->id,
            'winner_user_id' => $user->id,
            'title' => 'Subasta ganada de prueba',
            'description' => 'Subasta cerrada para probar Pendientes.',
            'starting_price' => 20,
            'current_price' => 75,
            'status' => 'finished',
            'image_url' => 'https://placehold.co/600x400?text=Subasta+ganada',
            'end_at' => Carbon::now()->subHour(),
            'paid_limit_at' => Carbon::now()->addDays(2),
            'is_paid' => false,
            'payed' => false,
        ]);

        Bid::create([
            'auction_id' => $auction->id,
            'user_id' => $user->id,
            'amount' => 75,
        ]);

        $this->command->info('Subasta ganada creada para el usuario ID 1.');
    }
}