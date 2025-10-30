<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Auction extends Model
{
    protected $fillable = [
        'product_id','title','description',
        'starting_price','current_price',
        'end_at','status','winner_user_id',
        'payed','image_url',
    ];

    protected $casts = [
        'end_at' => 'datetime',
        'payed'  => 'boolean',
    ];

    public function product(){ return $this->belongsTo(Product::class); }
}
