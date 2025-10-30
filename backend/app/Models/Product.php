<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = ['name', 'animal_id', 'image_url', 'description'];

    public function animal()
    {
        return $this->belongsTo(Animal::class);
    }

    public function auctions()
    {
        return $this->hasMany(Auction::class);
    }
}
