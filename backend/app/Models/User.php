<?php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable {
    use HasApiTokens, Notifiable;

    protected $fillable = ['name','email','password','avatar_url','bio'];
    protected $hidden = ['password','remember_token'];

    public function favorites()
{
    return $this->hasMany(\App\Models\Favorite::class);
}

    public function bids() { return $this->hasMany(Bid::class); }
}
