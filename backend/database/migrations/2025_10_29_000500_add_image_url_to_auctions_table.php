<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        if (!Schema::hasColumn('auctions', 'image_url')) {
            Schema::table('auctions', function (Blueprint $t) {
                $t->string('image_url')->nullable()->after('title');
            });
        }
    }
    public function down(): void {
        Schema::table('auctions', function (Blueprint $t) {
            $t->dropColumn('image_url');
        });
    }
};
