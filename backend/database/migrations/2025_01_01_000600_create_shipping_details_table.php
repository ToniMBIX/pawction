<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateShippingDetailsTable extends Migration
{ 
    public function up()
    {
        Schema::create('shipping_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('auction_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            $table->string('full_name');
            $table->string('address');
            $table->string('city');
            $table->string('province'); // 🔥 AÑADIDO PARA COHERENCIA
            $table->string('country');
            $table->string('postal_code');
            $table->string('phone');

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('shipping_details');
    }
}
