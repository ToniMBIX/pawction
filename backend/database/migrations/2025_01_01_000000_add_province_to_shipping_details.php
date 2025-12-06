<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('shipping_details', function (Blueprint $table) {
            $table->string('province')->nullable(false)->after('city');
        });
    }

    public function down()
    {
        Schema::table('shipping_details', function (Blueprint $table) {
            $table->dropColumn('province');
        });
    }
};
