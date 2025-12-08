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
    public $qr;

    public function __construct(Auction $auction)
    {
        $this->auction = $auction;

        // QR en base64 apuntando al PDF del animal
        $this->qr = base64_encode(
            QrCode::format('png')->size(250)->generate(
                url('/storage/animals/'.$auction->product->animal->pdf)
            )
        );
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
