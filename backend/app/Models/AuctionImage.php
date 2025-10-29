<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuctionImage extends Model
{
    protected $fillable = ['auction_id','url'];
    public function auction(){ return $this->belongsTo(Auction::class); }
}
