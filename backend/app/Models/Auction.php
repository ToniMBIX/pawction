<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Auction extends Model
{
    protected $fillable = [
        'product_id','title','description','starting_price','current_price',
        'end_at','status','winner_user_id','payed','image_url'
    ];

    protected $casts = [
        'end_at' => 'datetime',
        'payed'  => 'boolean',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function winnerUser(): BelongsTo
    {
        return $this->belongsTo(User::class,'winner_user_id');
    }

    public function bids()
    {
        return $this->hasMany(Bid::class)->latest();
    }

    public function favorites(){
    return $this->belongsToMany(\App\Models\User::class, 'favorites')->withTimestamps();
}


    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
