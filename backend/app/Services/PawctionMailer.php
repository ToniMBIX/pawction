<?php

namespace App\Services;

use App\Models\Auction;

class PawctionMailer
{
    public function __construct(
        private MailerSendService $mailer
    ) {}

    public function auctionFinished(Auction $auction, string $to): bool
    {
        $html = view('emails.auction_finished', [
            'auction' => $auction,
        ])->render();

        return $this->mailer->send(
            $to,
            'Has ganado una subasta - Pawction',
            $html
        );
    }

    public function auctionReopened(Auction $auction, string $to): bool
    {
        $html = view('emails.auction_reopened', [
            'auction' => $auction,
        ])->render();

        return $this->mailer->send(
            $to,
            'Subasta reabierta - Pawction',
            $html
        );
    }

    public function paymentCompleted(Auction $auction, string $to): bool
    {
        $shipping = $auction->shippingDetail;

        $html = view('emails.payment_completed', [
            'auction' => $auction,
            'shipping' => $shipping,
        ])->render();

        return $this->mailer->send(
            $to,
            'Pago completado - Pawction',
            $html
        );
    }
}