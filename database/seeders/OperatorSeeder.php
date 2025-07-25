<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class OperatorSeeder extends Seeder
{
    public function run(): void
    {
        $operators = [
            [
                'name' => 'Luna Stellare',
                'email' => 'luna@consulenza.com',
                'bio' => 'Esperta in astrologia e tarocchi con oltre 10 anni di esperienza.',
                'specialties' => ['Amore', 'Lavoro', 'Spiritualità'],
                'categories' => ['Astrologia', 'Tarocchi'],
                'rate_per_minute' => 2.50,
            ],
            [
                'name' => 'Marco Veggente',
                'email' => 'marco@consulenza.com',
                'bio' => 'Cartomante professionale specializzato in letture di coppia.',
                'specialties' => ['Amore', 'Famiglia'],
                'categories' => ['Cartomanzia', 'Tarocchi'],
                'rate_per_minute' => 3.00,
            ],
            [
                'name' => 'Sofia Cristalli',
                'email' => 'sofia@consulenza.com',
                'bio' => 'Terapeuta olistica e esperta in cristalloterapia.',
                'specialties' => ['Salute', 'Spiritualità'],
                'categories' => ['Cristalloterapia', 'Numerologia'],
                'rate_per_minute' => 2.80,
            ],
        ];

        foreach ($operators as $operator) {
            User::create([
                'name' => $operator['name'],
                'email' => $operator['email'],
                'password' => Hash::make('password123'),
                'role' => 'operator',
                'bio' => $operator['bio'],
                'specialties' => $operator['specialties'],
                'categories' => $operator['categories'],
                'rate_per_minute' => $operator['rate_per_minute'],
                'is_available' => true,
                'email_verified_at' => now(),
            ]);
        }
    }
}
