<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class DailyActiveAuctionsMail extends Mailable
{
    use Queueable, SerializesModels;

    public $auctions;

    public function __construct($auctions)
    {
        $this->auctions = $auctions;
    }

    public function build()
    {
        return $this
            ->subject('Resumen diario de subastas activas - Pawction')
            ->view('emails.daily_active_auctions')
            ->with([
                'auctions' => $this->auctions,
            ]);
    }
}