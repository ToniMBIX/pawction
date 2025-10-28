<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(){
        Schema::create('animals', function(Blueprint $t){
            $t->id();
            $t->string('name');
            $t->string('species')->nullable();
            $t->integer('age')->nullable();
            $t->text('description')->nullable();
            $t->string('photo_url')->nullable();
            $t->string('info_url')->nullable();
            $t->timestamps();
        });
    }
    public function down(){ Schema::dropIfExists('animals'); }
};
