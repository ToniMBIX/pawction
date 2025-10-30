<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('auctions', function (Blueprint $table) {
            // url opcional para que el front siempre tenga una imagen
            $table->string('image_url')->nullable()->after('title');
        });
    }

    public function down(): void
    {
        Schema::table('auctions', function (Blueprint $table) {
            $table->dropColumn('image_url');
        });
    }
};
