<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Auction;

class ShippingFormMail extends Mailable
{
    use Queueable, SerializesModels;

    public $auction;

    public function __construct(Auction $auction)
    {
        $this->auction = $auction;
    }

    public function build()
    {
        return $this->subject("Confirma el envío de tu adopción")
            ->view("emails.shipping_form");
    }
}
