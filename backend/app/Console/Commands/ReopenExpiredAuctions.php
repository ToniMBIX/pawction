<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Auction;
use App\Mail\AuctionReopenedMail;
use Illuminate\Support\Facades\Mail;

class ReopenExpiredAuctions extends Command
{
    protected $signature = 'auctions:reopen-expired';

    protected $description = 'Reabre subastas no pagadas fuera de plazo';

    public function handle()
    {
        $auctions = Auction::where('status', 'finished')
            ->where('is_paid', false)
            ->whereNotNull('paid_limit_at')
            ->where('paid_limit_at', '<', now())
            ->get();

        foreach ($auctions as $auction) {

            $oldWinner = $auction->winner;

            $auction->status = 'active';
            $auction->winner_user_id = null;
            $auction->paid_limit_at = null;
            $auction->payed = false;

            $auction->save();

            if ($oldWinner) {
                Mail::to($oldWinner->email)
                    ->send(new AuctionReopenedMail($auction));
            }

            $this->info("Subasta {$auction->id} reabierta.");
        }

        return Command::SUCCESS;
    }
}