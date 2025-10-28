<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(){
        Schema::create('payouts', function(Blueprint $t){
            $t->id();
            $t->foreignId('auction_id')->constrained()->cascadeOnDelete();
            $t->decimal('total_amount',10,2);
            $t->decimal('pawction_amount',10,2);
            $t->decimal('greenpeace_amount',10,2);
            $t->string('currency',3)->default('EUR');
            $t->timestamps();
        });
    }
    public function down(){ Schema::dropIfExists('payouts'); }
};
