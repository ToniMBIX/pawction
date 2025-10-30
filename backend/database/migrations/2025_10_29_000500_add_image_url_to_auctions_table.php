<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('auctions', function (Blueprint $t) {
            if (!Schema::hasColumn('auctions', 'image_url')) {
                $t->string('image_url')->nullable()->after('title');
            }
        });
    }
    public function down(): void {
        Schema::table('auctions', function (Blueprint $t) {
            $t->dropColumn('image_url');
        });
    }
};
