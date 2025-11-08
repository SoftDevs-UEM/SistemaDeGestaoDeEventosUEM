<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create an admin user for development
        if (!User::where('email', 'admin@uem.local')->exists()) {
            User::create([
                'name' => 'Admin UEM',
                'email' => 'admin@uem.local',
                'password' => Hash::make('admin123'),
                'telefone' => '+258000000000',
                'tipo' => 'admin',
            ]);
        }
    }
}
