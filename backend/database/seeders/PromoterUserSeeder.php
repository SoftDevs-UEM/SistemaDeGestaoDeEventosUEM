<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class PromoterUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Promoter UEM',
            'email' => 'promoter@uem.local',
            'password' => Hash::make('promoter123'),
            'telefone' => '+258000000000',
            'tipo' => 'promotor', // Use 'promotor' type for promoters
        ]);
    }
}