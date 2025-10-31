<?php
namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\{Auction,User};
use App\Mail\WinnerConfirmation;
use App\Services\PdfService;
use App\Services\QrService;
use Illuminate\Support\Facades\Mail;

class SendTransactionalEmailJob implements ShouldQueue {
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $userId; public $auctionId;
    public function __construct($userId,$auctionId){ $this->userId=$userId; $this->auctionId=$auctionId; }

    public function handle(PdfService $pdf, QrService $qr){
        $user = User::find($this->userId);
        $auction = Auction::with('product.animal')->find($this->auctionId);
        if(!$user || !$auction) return;

        // Genera el QR (se usará dentro del PDF)
        $qr->generateForAuction($auction);

        // Construye y guarda el PDF
        $path = storage_path('app/pdfs/winner_'.$auction->id.'.pdf');
        if(!file_exists(dirname($path))){ mkdir(dirname($path),0777,true); }
        $pdf->buildWinnerPdf($auction, $path);

        // Envía el email con el PDF adjunto
        Mail::to($user->email)->send(new WinnerConfirmation($auction, $path));
    }
}
