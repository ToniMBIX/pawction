<?php
namespace App\Services;

use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\{Auction};

class PdfService {
    public function buildWinnerPdf(Auction $auction, string $path){
        $html = view('pdf.winner', ['auction'=>$auction])->render();
        $pdf = Pdf::loadHTML($html);
        $pdf->save($path);
        return $path;
    }
}
