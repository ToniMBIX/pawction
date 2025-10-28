<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(){
        Schema::create('favorites', function(Blueprint $t){
            $t->id();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->foreignId('auction_id')->constrained()->cascadeOnDelete();
            $t->timestamps();
            $t->unique(['user_id','auction_id']);
        });
    }
    public function down(){ Schema::dropIfExists('favorites'); }
};
