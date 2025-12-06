<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShippingDetail extends Model
{
    protected $fillable = [
    'auction_id',
    'user_id',
    'full_name',
    'address',
    'city',
    'province',
    'country',
    'postal_code',
    'phone'
];

}
