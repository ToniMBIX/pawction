<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Auction;

class PendingAuctionsSeeder extends Seeder
{
    public function run()
    {
        // Usuario ganador (ID real)
        $winnerId = 3;

        // IDs de subastas que quieres marcar como ganadas
        $auctionIds = [14, 15, 16];

        foreach ($auctionIds as $id) {
            Auction::where('id', $id)->update([
                'winner_user_id' => $winnerId,
                'is_paid'   => false,
            ]);
        }
    }
}
