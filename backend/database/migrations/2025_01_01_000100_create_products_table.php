<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(){
        Schema::create('products', function(Blueprint $t){
            $t->id();
            $t->string('name');
            $t->foreignId('animal_id')->constrained()->cascadeOnDelete();
            $t->string('image_url')->nullable();
            $t->string('qr_code_path')->nullable();
            $t->timestamps();
        });
    }
    public function down(){ Schema::dropIfExists('products'); }
};
