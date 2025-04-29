<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            UserSeeder::class,
            InternetPackageSeeder::class,
            CustomerSeeder::class,
            InvoiceSeeder::class,
            CashflowCategorySeeder::class,
            CashflowSeeder::class,
        ]);
    }
}
