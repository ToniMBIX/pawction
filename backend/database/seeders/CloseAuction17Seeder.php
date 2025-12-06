<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Auction;
use Carbon\Carbon;

class CloseAuction17Seeder extends Seeder
{
    public function run()
    {
        $auction = Auction::find(17);

        if (!$auction) {
            echo "La subasta con ID 17 no existe.\n";
            return;
        }

        // Simular que terminó hace 24 horas
        $auction->end_at = Carbon::now()->subHours(24);

        // Marcar como finalizada (si tu modelo usa este campo)
        $auction->status = "completed";

        // No tocamos winner_user_id ni winner_email ni current_price.
        // Ya tienes una puja hecha, así que tu lógica interna debería asignar ganador.

        $auction->save();

        echo "Subasta 17 marcada como expirada (24h pasadas).\n";
    }
}
