<?php

namespace App\Console\Commands;

use App\Models\Auction;
use Illuminate\Console\Command;

class ReopenExpiredAuctions extends Command
{
    protected $signature = 'auctions:reopen-expired';

    protected $description = 'Reabre subastas no pagadas fuera de plazo';

    public function handle()
    {
        $auctions = Auction::where('status', 'finished')
            ->where('is_paid', false)
            ->whereNotNull('winner_user_id')
            ->whereNotNull('paid_limit_at')
            ->where('paid_limit_at', '<=', now())
            ->get();

        foreach ($auctions as $auction) {
            $auction->reopenForNonPayment();

            $this->info("Subasta {$auction->id} reabierta.");
        }

        $this->info("Total reabiertas: {$auctions->count()}");

        return Command::SUCCESS;
    }
}