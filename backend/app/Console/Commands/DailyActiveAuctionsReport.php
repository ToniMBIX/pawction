<?php

namespace App\Console\Commands;

use App\Mail\DailyActiveAuctionsMail;
use App\Models\Auction;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class DailyActiveAuctionsReport extends Command
{
    protected $signature = 'auctions:daily-active-report';

    protected $description = 'Envía un resumen diario de subastas activas';

    public function handle()
    {
        $adminEmail = env('ADMIN_REPORT_EMAIL');

        if (!$adminEmail) {
            $this->error('Falta ADMIN_REPORT_EMAIL en .env');
            return Command::FAILURE;
        }

        $auctions = Auction::with('product.animal')
            ->where('status', 'active')
            ->orderBy('end_at')
            ->get();

        Mail::to($adminEmail)->send(new DailyActiveAuctionsMail($auctions));

        $this->info("Resumen enviado a {$adminEmail}. Subastas activas: {$auctions->count()}");

        return Command::SUCCESS;
    }
}