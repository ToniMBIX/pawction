<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\{Favorite,Auction};

class FavoriteController extends Controller {
    public function toggle(Request $request, Auction $auction){
        $fav = Favorite::firstOrNew([
            'user_id'=>$request->user()->id,
            'auction_id'=>$auction->id
        ]);
        if($fav->exists){ $fav->delete(); $on=false; } else { $fav->save(); $on=true; }
        return response()->json(['favorite'=>$on]);
    }
}
