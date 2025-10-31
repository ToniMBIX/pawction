<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Auction extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id','title','description','starting_price','current_price',
        'end_at','status','winner_user_id','payed','image_url'
    ];

    protected $casts = [
        'end_at' => 'datetime',
        'payed'  => 'boolean',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function winner()
    {
        return $this->belongsTo(User::class, 'winner_user_id');
    }
    public function bids(){ return $this->hasMany(\App\Models\Bid::class); }

}
