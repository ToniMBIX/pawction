<?php

namespace App\Jobs;

use App\Models\Auction;
use App\Models\User;
use App\Services\PawctionMailer;
use App\Services\PdfService;
use App\Services\QrService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendTransactionalEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $userId;
    public $auctionId;

    public function __construct($userId, $auctionId)
    {
        $this->userId = $userId;
        $this->auctionId = $auctionId;
    }

    public function handle(
        PdfService $pdf,
        QrService $qr,
        PawctionMailer $mailer
    ) {
        $user = User::find($this->userId);

        $auction = Auction::with([
            'product.animal',
            'shippingDetail',
        ])->find($this->auctionId);

        if (!$user || !$auction) {
            return;
        }

        /*
         * Mantengo estas llamadas por compatibilidad con tu código antiguo.
         * Si no usas PdfService/QrService en producción, no pasa nada.
         */
        try {
            $qr->generateForAuction($auction);

            $path = storage_path('app/pdfs/winner_' . $auction->id . '.pdf');

            if (!file_exists(dirname($path))) {
                mkdir(dirname($path), 0777, true);
            }

            $pdf->buildWinnerPdf($auction, $path);
        } catch (\Throwable $e) {
            \Log::warning('No se pudo generar PDF/QR del job transaccional', [
                'auction_id' => $auction->id,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }

        /*
         * Envío por MailerSend API HTTP, no SMTP.
         */
        $sent = $mailer->auctionFinished(
            $auction->fresh('product.animal'),
            $user->email
        );

        if (!$sent) {
            \Log::warning('No se pudo enviar email transaccional por API', [
                'auction_id' => $auction->id,
                'user_id' => $user->id,
            ]);
        }
    }
}