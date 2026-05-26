<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Auction extends Model
{
    protected $fillable = [
        'product_id',
        'title',
        'description',
        'starting_price',
        'current_price',
        'end_at',
        'status',
        'winner_user_id',
        'payed',
        'image_url',
        'document_url',
        'is_paid',
        'qr_url',
        'paid_limit_at',
    ];

    protected $casts = [
        'end_at' => 'datetime',
        'paid_limit_at' => 'datetime',
        'current_price' => 'integer',
        'starting_price' => 'integer',
        'payed' => 'boolean',
        'is_paid' => 'boolean',
    ];

    protected $appends = [
        'ends_in_seconds',
        'started',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function bids()
    {
        return $this->hasMany(Bid::class)->orderByDesc('id');
    }

    public function favoredBy()
    {
        return $this->belongsToMany(User::class, 'favorites', 'auction_id', 'user_id')
            ->withTimestamps();
    }

    public function shippingDetail()
    {
        return $this->hasOne(ShippingDetail::class, 'auction_id');
    }

    public function winner()
    {
        return $this->belongsTo(User::class, 'winner_user_id');
    }

    public function getEndsInSecondsAttribute()
    {
        if (!$this->end_at) {
            return null;
        }

        $sec = now()->diffInSeconds($this->end_at, false);

        return $sec > 0 ? $sec : 0;
    }

    public function getStartedAttribute()
    {
        return (int) $this->current_price > 0 && !is_null($this->end_at);
    }

    public function closeNow(): void
    {
        if ($this->status !== 'active') {
            return;
        }

        $lastBid = $this->bids()
            ->orderByDesc('amount')
            ->orderByDesc('id')
            ->first();

        $this->status = 'finished';
        $this->winner_user_id = $lastBid?->user_id;
        $this->paid_limit_at = now()->addDays(2);
        $this->is_paid = false;
        $this->payed = false;
        $this->save();

        if (!$this->winner_user_id) {
            return;
        }

        $winner = User::find($this->winner_user_id);

        if (!$winner) {
            return;
        }

        try {
    \Mail::to($winner->email)->send(
        new \App\Mail\AuctionFinishedMail($this->loadMissing('product.animal'))
    );
} catch (\Throwable $e) {
    \Log::warning('No se pudo enviar email de subasta ganada', [
        'auction_id' => $this->id,
        'winner_user_id' => $winner->id,
        'error' => $e->getMessage(),
    ]);
}
    }
}