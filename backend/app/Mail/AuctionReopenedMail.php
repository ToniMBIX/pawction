<?php

namespace App\Mail;

use App\Models\Auction;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AuctionReopenedMail extends Mailable
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
            ->subject('La subasta ha sido reabierta - Pawction')
            ->view('emails.auction_reopened')
            ->with([
                'auction' => $this->auction,
            ]);
    }
}