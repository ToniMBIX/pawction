<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(){
        if (!Schema::hasTable('favorites')) {
            Schema::create('favorites', function (Blueprint $t) {
                $t->id();
                $t->foreignId('user_id')->constrained()->cascadeOnDelete();
                $t->foreignId('auction_id')->constrained()->cascadeOnDelete();
                $t->timestamps();
                $t->unique(['user_id','auction_id'],'favorites_user_auction_unique');
            });
        } else {
            Schema::table('favorites', function (Blueprint $t) {
                if (!Schema::hasColumn('favorites','user_id')) {
                    $t->foreignId('user_id')->constrained()->cascadeOnDelete();
                }
                if (!Schema::hasColumn('favorites','auction_id')) {
                    $t->foreignId('auction_id')->constrained()->cascadeOnDelete();
                }
                // Evita duplicados
                $sm = Schema::getConnection()->getDoctrineSchemaManager();
                $indexes = array_map(fn($i)=>$i->getName(), $sm->listTableIndexes('favorites'));
                if (!in_array('favorites_user_auction_unique', $indexes)) {
                    $t->unique(['user_id','auction_id'],'favorites_user_auction_unique');
                }
            });
        }
    }
    public function down(){
        Schema::dropIfExists('favorites');
    }
};
