<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = ['name','animal_id','image_url'];

    public function animal()
    {
        return $this->belongsTo(Animal::class);
    }
}
