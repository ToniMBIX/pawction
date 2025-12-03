<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Auction;
use App\Models\ShippingDetail;
use PDF;

class OrderCompletedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $auction;
    public $shipping;

    public function __construct(Auction $auction, ShippingDetail $shipping)
    {
        $this->auction = $auction;
        $this->shipping = $shipping;
    }

    public function build()
    {
        $pdf = PDF::loadView("pdf.order", [
            "auction" => $this->auction,
            "shipping" => $this->shipping
        ]);

        return $this->subject("Confirmación de adopción")
            ->view("emails.order_completed")
            ->attachData($pdf->output(), "adopcion.pdf");
    }
}
