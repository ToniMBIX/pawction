<?php
namespace App\Services;

use Endroid\QrCode\Builder\Builder;
use App\Models\Auction;

class QrService {
    public function generateForAuction(Auction $auction){
        $url = $auction->product->animal->info_url ?? url('/animals/'.$auction->product->animal->id);
        $path = storage_path('app/qr/auction_'.$auction->id.'.png');
        if(!file_exists(dirname($path))){ mkdir(dirname($path),0777,true); }
        $result = Builder::create()->data($url)->build();
        $result->saveToFile($path);
        return $path;
    }
}
