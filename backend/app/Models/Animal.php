<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Animal extends Model
{
    use HasFactory;

    protected $fillable = ['name','species','age','description','photo_url','info_url'];

    public function product()
    {
        return $this->hasOne(Product::class);
    }
}
