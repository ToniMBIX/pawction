<?php

namespace App\Mail;

use App\Models\Auction;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PaymentCompleted extends Mailable
{
    use Queueable, SerializesModels;

    public $auction;

    public function __construct(Auction $auction)
    {
        $this->auction = $auction;

    }

    public function build()
    {
        return $this->subject('Pago completado - Pawction')
                    ->view('emails.payment_completed')
                    ->with([
                        'auction' => $this->auction,
                    ])
                    ->attach(storage_path('app/public/products/'.$this->auction->product->image), [
                        'as' => 'producto.jpg',
                        'mime' => 'image/jpeg'
                    ]);
    }
}
