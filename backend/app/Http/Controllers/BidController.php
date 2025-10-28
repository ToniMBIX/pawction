<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\{Auction,Bid};
use App\Jobs\CloseAuctionJob;
use Carbon\Carbon;

class BidController extends Controller {
    public function store(Request $request){
        $data = $request->validate([
            'auction_id'=>'required|exists:auctions,id',
            'amount'=>'required|numeric|min:0.01'
        ]);
        $userId = $request->user()->id;

        return DB::transaction(function() use ($data, $userId){
            $auction = Auction::lockForUpdate()->find($data['auction_id']);
            abort_if(!$auction || $auction->status!=='active', 400, 'Subasta no activa');
            abort_if($data['amount'] <= $auction->current_price, 422, 'La puja debe ser superior');

            // Crear puja
            $bid = Bid::create([
                'user_id'=>$userId,
                'auction_id'=>$auction->id,
                'amount'=>$data['amount']
            ]);

            // Actualizar precio y **reiniciar 24h**
            $auction->current_price = $data['amount'];
            $auction->end_at = now()->addDay(); // 24h desde la puja
            $auction->winner_user_id = $userId;
            $auction->save();

            // Reprogramar el cierre seguro
            CloseAuctionJob::dispatch($auction->id)->delay($auction->end_at->addSecond());

            return response()->json(['ok'=>true,'auction'=>$auction,'bid'=>$bid]);
        });
    }
}
