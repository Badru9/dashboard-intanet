<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'username' => 'admin',
            'password' => Hash::make('password'),
            'phone' => '081234567890',
            'address' => 'Jl. Admin No. 1',
            'is_admin' => '1'
        ]);

        // Create regular users using Faker
        \App\Models\User::factory(10)->create();
    }
}
