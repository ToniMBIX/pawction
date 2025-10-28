<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Auction extends Model {
    use HasFactory;

    protected $fillable = [
        'title','description','starting_price','current_price','end_at',
        'product_id','status','winner_user_id'
    ];
    protected $casts = [
        'end_at' => 'datetime'
    ];

    public function product(){ return $this->belongsTo(Product::class); }
    public function bids(){ return $this->hasMany(Bid::class)->latest(); }
    public function winner(){ return $this->belongsTo(User::class,'winner_user_id'); }
}
