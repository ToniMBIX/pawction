<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddWinnerIdToAuctions extends Migration
{
    public function up()
    {
        Schema::table('auctions', function (Blueprint $table) {
            $table->string('winner_email')->nullable();
            $table->boolean('is_paid')->default(false);
        });
    }

    public function down()
    {
        Schema::table('auctions', function (Blueprint $table) {
            $table->dropColumn([ 'winner_email', 'is_paid']);
        });
    }
}
