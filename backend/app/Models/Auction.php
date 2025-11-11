<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Auction extends Model
{
    protected $fillable = [
        'product_id','title','description','starting_price','current_price',
        'end_at','status','winner_user_id','payed','image_url'
    ];

    protected $casts = [
        'end_at'        => 'datetime',
        'current_price' => 'integer',
    ];

    protected $appends = ['ends_in_seconds','started'];

    public function product(){ return $this->belongsTo(Product::class); }
    public function bids(){ return $this->hasMany(Bid::class)->orderByDesc('id'); }

    public function getEndsInSecondsAttribute()
    {
        if (!$this->end_at) return null;
        $sec = now()->diffInSeconds($this->end_at, false);
        return $sec > 0 ? $sec : 0;
    }

    public function getStartedAttribute()
    {
        return (int)$this->current_price > 0 && !is_null($this->end_at);
    }

    /** Cierra la subasta y fija ganador (última puja más alta) */
    public function closeNow(): void
    {
        if ($this->status !== 'active') return;

        $lastBid = $this->bids()->orderByDesc('amount')->orderByDesc('id')->first();
        $this->status = 'finished';
        $this->winner_user_id = $lastBid?->user_id;
        $this->save();
    }
}
