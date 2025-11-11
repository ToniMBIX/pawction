<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Auction;
use Illuminate\Support\Facades\DB;

class CloseExpiredAuctions extends Command
{
    protected $signature = 'auctions:close-expired';
    protected $description = 'Marca como finalizadas las subastas activas vencidas y fija ganador';

    public function handle(): int
    {
        $now = now();

        $ids = Auction::where('status','active')
            ->whereNotNull('end_at')
            ->where('end_at','<=',$now)
            ->pluck('id');

        foreach ($ids as $id) {
            DB::transaction(function () use ($id) {
                $a = Auction::lockForUpdate()->with('bids')->find($id);
                if ($a && $a->status === 'active' && $a->end_at && now()->greaterThanOrEqualTo($a->end_at)) {
                    $a->closeNow();
                }
            });
        }

        $this->info("Cerradas: ".count($ids));
        return self::SUCCESS;
    }
}
