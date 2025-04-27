<?php

namespace Database\Seeders;

use App\Models\InternetPackage;
use Illuminate\Database\Seeder;

class InternetPackageSeeder extends Seeder
{
    public function run(): void
    {
        $packages = [
            [
                'name' => 'Basic Plan',
                'speed' => 10,
                'price' => 299000,
            ],
            [
                'name' => 'Standard Plan',
                'speed' => 20,
                'price' => 499000,
            ],
            [
                'name' => 'Premium Plan',
                'speed' => 50,
                'price' => 999000,
            ],
            [
                'name' => 'Business Plan',
                'speed' => 100,
                'price' => 1999000,
            ],
            [
                'name' => 'Enterprise Plan',
                'speed' => 200,
                'price' => 3999000,
            ],
        ];

        foreach ($packages as $package) {
            InternetPackage::create($package);
        }
    }
}
