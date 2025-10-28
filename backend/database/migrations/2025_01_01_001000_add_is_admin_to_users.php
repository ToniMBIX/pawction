<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(){
        Schema::table('users', function(Blueprint $t){
            if(!Schema::hasColumn('users','is_admin')){
                $t->boolean('is_admin')->default(false);
            }
        });
    }
    public function down(){
        Schema::table('users', function(Blueprint $t){
            if(Schema::hasColumn('users','is_admin')){
                $t->dropColumn('is_admin');
            }
        });
    }
};
