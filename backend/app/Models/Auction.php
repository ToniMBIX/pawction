<?php

namespace App\Models;

use App\Mail\AuctionFinishedMail;
use App\Mail\AuctionReopenedMail;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

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

        if (!$lastBid) {
            $this->winner_user_id = null;
            $this->end_at = null;
            $this->save();

            return;
        }

        $this->status = 'finished';
        $this->winner_user_id = $lastBid->user_id;
        $this->paid_limit_at = now()->addDays(2);
        $this->is_paid = false;
        $this->payed = false;
        $this->save();

        $winner = User::find($this->winner_user_id);

        if (!$winner) {
            return;
        }

        try {
            Mail::to($winner->email)->send(
                new AuctionFinishedMail($this->fresh('product.animal'))
            );
        } catch (\Throwable $e) {
            Log::warning('No se pudo enviar email de subasta ganada', [
                'auction_id' => $this->id,
                'winner_user_id' => $winner->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function reopenForNonPayment(): void
    {
        if ($this->status !== 'finished') {
            return;
        }

        if ($this->is_paid) {
            return;
        }

        if (!$this->winner_user_id) {
            return;
        }

        $oldWinner = $this->winner;

        $this->status = 'active';
        $this->winner_user_id = null;
        $this->paid_limit_at = null;
        $this->is_paid = false;
        $this->payed = false;
        $this->end_at = null;
        $this->current_price = 0;
        $this->save();

        if (!$oldWinner) {
            return;
        }

        try {
            Mail::to($oldWinner->email)->send(
                new AuctionReopenedMail($this->fresh('product.animal'))
            );
        } catch (\Throwable $e) {
            Log::warning('No se pudo enviar email de subasta reabierta', [
                'auction_id' => $this->id,
                'old_winner_id' => $oldWinner->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}