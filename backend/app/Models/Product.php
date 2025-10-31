<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory;

    protected $fillable = ['name','animal_id','image_url'];

    public function animal(){
    return $this->belongsTo(\App\Models\Animal::class);
}


    public function auction()
    {
        return $this->hasOne(Auction::class);
    }
}
