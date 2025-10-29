<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Auction extends Model
{
    protected $fillable = [
        'title','description','starting_price','current_price','starts_at','ends_at','status','user_id'
    ];
    protected $casts = [
        'starts_at'=>'datetime',
        'ends_at'=>'datetime',
        'starting_price'=>'decimal:2',
        'current_price'=>'decimal:2',
    ];

    public function user(){ return $this->belongsTo(User::class); }
    public function bids(){ return $this->hasMany(Bid::class); }
    public function images(){ return $this->hasMany(AuctionImage::class); }
}
