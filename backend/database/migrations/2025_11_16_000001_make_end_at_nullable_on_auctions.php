<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Opción sencilla: DROPEAR y VOLVER A CREAR la columna end_at como nullable.
        Schema::table('auctions', function (Blueprint $table) {
            $table->dropColumn('end_at');
        });

        Schema::table('auctions', function (Blueprint $table) {
            $table->timestamp('end_at')->nullable()->after('current_price');
        });
    }

    public function down(): void
    {
        // Volver a not null (por si haces rollback)
        Schema::table('auctions', function (Blueprint $table) {
            $table->dropColumn('end_at');
        });

        Schema::table('auctions', function (Blueprint $table) {
            $table->timestamp('end_at')->after('current_price');
        });
    }
};
