<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = ['name','animal_id'];
    public function auctions(){ return $this->hasMany(Auction::class); }
}
