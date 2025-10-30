<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Animal extends Model
{
    protected $fillable = ['name','species','age','description','photo_url','info_url'];

    public function products()
    {
        return $this->hasMany(Product::class);
        // si prefieres 1 a 1: return $this->hasOne(Product::class);
    }
}
