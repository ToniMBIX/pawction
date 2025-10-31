<?php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable {
    use HasApiTokens, Notifiable;

    protected $fillable = ['name','email','password','avatar_url','bio'];
    protected $hidden = ['password','remember_token'];

    public function favoriteAuctions()
{
    return $this->belongsToMany(\App\Models\Auction::class, 'favorites');
}


public function bids(){
    return $this->hasMany(\App\Models\Bid::class);
}
public function favorites()
{
    return $this->belongsToMany(Auction::class, 'favorites')->withTimestamps();
}

public function hasFavorited($auctionId): bool
{
    return $this->favorites()->where('auction_id',$auctionId)->exists();
}

}
