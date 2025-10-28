<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(){
        Schema::create('auctions', function(Blueprint $t){
            $t->id();
            $t->foreignId('product_id')->constrained()->cascadeOnDelete();
            $t->string('title');
            $t->text('description')->nullable();
            $t->decimal('starting_price',10,2)->default(0);
            $t->decimal('current_price',10,2)->default(0);
            $t->timestamp('end_at');
            $t->enum('status',['active','finished','cancelled'])->default('active');
            $t->foreignId('winner_user_id')->nullable()->constrained('users')->nullOnDelete();
            $t->boolean('payed')->default(false);
            $t->timestamps();
        });
    }
    public function down(){ Schema::dropIfExists('auctions'); }
};
