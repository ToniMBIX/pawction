<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder {
    public function run(){
        if(!User::where('email','admin@pawction.local')->exists()){
            User::create([
                'name'=>'Admin',
                'email'=>'admin@pawction.local',
                'password'=>Hash::make('Admin123!'),
                'is_admin'=>true
            ]);
        }
    } 
}
