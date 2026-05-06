<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(){
        Schema::table('favorites', function(Blueprint $t){
            if (!Schema::hasColumn('favorites','user_id')) return;
            $t->unique(['user_id','auction_id'],'favorites_user_auction_unique');
        });
    }
    public function down(){
        Schema::table('favorites', function(Blueprint $t){
            $t->dropUnique('favorites_user_auction_unique');
        });
    }
};
