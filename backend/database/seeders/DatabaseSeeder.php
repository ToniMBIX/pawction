<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {

        $this->call([
            \Database\Seeders\AdminUserSeeder::class,
            \Database\Seeders\CloseAuction17Seeder::class
        ]);

    }
}
