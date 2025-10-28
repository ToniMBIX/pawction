<?php
namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Auction;

class WinnerConfirmation extends Mailable {
    use Queueable, SerializesModels;

    public $auction; public $pdfPath;
    public function __construct(Auction $auction, string $pdfPath){ $this->auction=$auction; $this->pdfPath=$pdfPath; }

    public function build(){
        return $this->subject('¡Has ganado la subasta!')
            ->view('emails.winner')
            ->attach($this->pdfPath, ['as'=>'confirmacion-pawction.pdf','mime'=>'application/pdf']);
    }
}
