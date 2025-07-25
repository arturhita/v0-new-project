<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ClientSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Cliente Demo',
            'email' => 'cliente@consulenza.com',
            'password' => Hash::make('password123'),
            'role' => 'client',
            'wallet_balance' => 100.00,
            'is_approved' => true,
        ]);
    }
}
