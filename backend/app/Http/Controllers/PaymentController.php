<?php
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Mail;

public function checkout(Request $request, Auction $auction)
{
    $user = $request->user();

    $pdf = Pdf::loadView('pdf.receipt', [
        'user' => $user,
        'auction' => $auction,
        'amount_pawction' => $auction->current_price / 2,
        'amount_greenpeace' => $auction->current_price / 2
    ]);

    $path = storage_path("app/receipts/receipt_{$auction->id}.pdf");
    $pdf->save($path);

    // Simula envío de correo
    Mail::raw("Gracias por tu donación. Adjunto el recibo.", function($m) use ($user, $path) {
        $m->to($user->email)->subject('Confirmación de pago Pawction');
        $m->attach($path);
    });

    return response()->json(['message' => 'Pago confirmado y recibo enviado.']);
}
