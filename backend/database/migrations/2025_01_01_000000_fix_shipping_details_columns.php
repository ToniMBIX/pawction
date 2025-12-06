<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class FixShippingDetailsColumns extends Migration
{
    public function up()
    {
        Schema::table('shipping_details', function (Blueprint $table) {

            // Solo añadimos columnas si no existen
            if (!Schema::hasColumn('shipping_details', 'full_name')) {
                $table->string('full_name')->nullable();
            }

            if (!Schema::hasColumn('shipping_details', 'address')) {
                $table->string('address')->nullable();
            }

            if (!Schema::hasColumn('shipping_details', 'city')) {
                $table->string('city')->nullable();
            }

            if (!Schema::hasColumn('shipping_details', 'country')) {
                $table->string('country')->nullable();
            }

            if (!Schema::hasColumn('shipping_details', 'postal_code')) {
                $table->string('postal_code')->nullable();
            }

            if (!Schema::hasColumn('shipping_details', 'phone')) {
                $table->string('phone')->nullable();
            }

            if (!Schema::hasColumn('shipping_details', 'auction_id')) {
                $table->foreignId('auction_id')->nullable()->constrained()->onDelete('cascade');
            }

            if (!Schema::hasColumn('shipping_details', 'user_id')) {
                $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            }
        });
    }

    public function down()
    {
        // No eliminamos nada por seguridad
    }
}
