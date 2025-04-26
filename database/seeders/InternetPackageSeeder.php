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
                'speed' => '10 Mbps',
                'price' => 299000,
            ],
            [
                'name' => 'Standard Plan',
                'speed' => '20 Mbps',
                'price' => 499000,
            ],
            [
                'name' => 'Premium Plan',
                'speed' => '50 Mbps',
                'price' => 999000,
            ],
            [
                'name' => 'Business Plan',
                'speed' => '100 Mbps',
                'price' => 1999000,
            ],
            [
                'name' => 'Enterprise Plan',
                'speed' => '200 Mbps',
                'price' => 3999000,
            ],
        ];

        foreach ($packages as $package) {
            InternetPackage::create($package);
        }
    }
}
