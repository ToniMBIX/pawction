<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Auction extends Model
{
    protected $fillable = [
        'product_id','title','description','image_url',
        'starting_price','current_price','end_at','status',
        'winner_user_id','payed'
    ];

    protected $casts = [
        'end_at' => 'datetime',
        'payed'  => 'boolean',
    ];

    public function product(){ return $this->belongsTo(Product::class); }
    public function bids(){ return $this->hasMany(Bid::class); }

    // favoritos: usuarios que marcaron esta subasta
    public function favorites()
    {
        return $this->belongsToMany(User::class, 'favorites')->withTimestamps();
    }
}
