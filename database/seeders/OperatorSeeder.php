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
                'bio' => 'Esperta in astrologia e tarocchi con oltre 15 anni di esperienza. Specializzata in letture dell\'amore e del destino.',
                'hourly_rate' => 45.00,
                'specialties' => ['Astrologia', 'Tarocchi', 'Cartomanzia'],
                'is_online' => true,
            ],
            [
                'name' => 'Marco Veggente',
                'email' => 'marco@consulenza.com',
                'bio' => 'Medium e cartomante professionista. Aiuto le persone a trovare chiarezza nelle situazioni difficili.',
                'hourly_rate' => 38.00,
                'specialties' => ['Medianità', 'Cartomanzia', 'Numerologia'],
                'is_online' => false,
            ],
            [
                'name' => 'Sofia Cristalli',
                'email' => 'sofia@consulenza.com',
                'bio' => 'Terapeuta olistica specializzata in cristalloterapia e reiki. Percorsi di guarigione energetica.',
                'hourly_rate' => 42.00,
                'specialties' => ['Cristalloterapia', 'Reiki'],
                'is_online' => true,
            ],
        ];

        foreach ($operators as $operatorData) {
            User::create([
                'name' => $operatorData['name'],
                'email' => $operatorData['email'],
                'password' => Hash::make('password123'),
                'role' => 'operator',
                'status' => 'active',
                'bio' => $operatorData['bio'],
                'hourly_rate' => $operatorData['hourly_rate'],
                'specialties' => $operatorData['specialties'],
                'is_online' => $operatorData['is_online'],
                'email_verified_at' => now(),
                'last_seen' => now(),
            ]);
        }
    }
}
