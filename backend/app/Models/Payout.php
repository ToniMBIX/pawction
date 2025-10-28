<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payout extends Model {
    protected $fillable = ['auction_id','total_amount','pawction_amount','greenpeace_amount','currency'];
    public function auction(){ return $this->belongsTo(Auction::class); }
}
