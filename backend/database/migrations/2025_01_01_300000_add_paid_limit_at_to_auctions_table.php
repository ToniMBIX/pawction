<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('auctions', function (Blueprint $table) {
            // Fecha límite de pago (5 minutos después de ganar)
            $table->timestamp('paid_limit_at')->nullable()->after('winner_user_id');
        });
    }

    public function down()
    {
        Schema::table('auctions', function (Blueprint $table) {
            $table->dropColumn('paid_limit_at');
        });
    }
};
