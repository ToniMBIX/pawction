<?php

namespace App\Mail;

use App\Models\Auction;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AuctionFinishedMail extends Mailable
{
    use Queueable, SerializesModels;

    public Auction $auction;

    public function __construct(Auction $auction)
    {
        $this->auction = $auction->loadMissing('product.animal');
    }

    public function build()
    {
        return $this
            ->subject('Has ganado una subasta - Pawction')
            ->view('emails.winner')
            ->with([
                'auction' => $this->auction,
            ]);
    }
}