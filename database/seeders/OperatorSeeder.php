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
                'bio' => 'Esperta in lettura dei tarocchi e astrologia con oltre 10 anni di esperienza.',
                'hourly_rate' => 60.00,
                'specialties' => ['Amore', 'Tarocchi', 'Astrologia'],
                'rating' => 4.8,
                'reviews_count' => 127,
                'is_online' => true,
            ],
            [
                'name' => 'Marco Visioni',
                'email' => 'marco@consulenza.com',
                'bio' => 'Consulente spirituale specializzato in crescita personale e relazioni.',
                'hourly_rate' => 45.00,
                'specialties' => ['Spiritualità', 'Famiglia', 'Lavoro'],
                'rating' => 4.6,
                'reviews_count' => 89,
                'is_online' => false,
            ],
            [
                'name' => 'Sofia Intuizione',
                'email' => 'sofia@consulenza.com',
                'bio' => 'Medium e cartomante con dono naturale per la chiaroveggenza.',
                'hourly_rate' => 75.00,
                'specialties' => ['Amore', 'Spiritualità', 'Tarocchi'],
                'rating' => 4.9,
                'reviews_count' => 203,
                'is_online' => true,
            ],
        ];

        foreach ($operators as $operatorData) {
            User::create([
                'name' => $operatorData['name'],
                'email' => $operatorData['email'],
                'password' => Hash::make('password123'),
                'role' => 'operator',
                'bio' => $operatorData['bio'],
                'hourly_rate' => $operatorData['hourly_rate'],
                'specialties' => $operatorData['specialties'],
                'rating' => $operatorData['rating'],
                'reviews_count' => $operatorData['reviews_count'],
                'is_online' => $operatorData['is_online'],
                'is_approved' => true,
            ]);
        }
    }
}
