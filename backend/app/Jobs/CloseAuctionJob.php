<?php
namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\Auction;

class CloseAuctionJob implements ShouldQueue {
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $auctionId;
    public function __construct($auctionId){ $this->auctionId = $auctionId; }

    public function handle(){
        $auction = Auction::find($this->auctionId);
        if(!$auction) return;
        if(now()->lt($auction->end_at)) return; // aún no termina (hubo otra puja)
        if($auction->status!=='active') return;

        $auction->status = 'finished';
        $auction->save();
        // Aquí podríamos notificar al ganador que realice el pago en 24h
    }
}
