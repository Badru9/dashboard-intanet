<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class CashflowSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('id_ID');
        $users = DB::table('users')->pluck('id')->toArray();
        $categories = DB::table('cashflow_categories')->pluck('id')->toArray();
        $invoices = DB::table('invoices')->pluck('id')->toArray();

        $data = [];
        foreach (range(1, 50) as $i) {
            $data[] = [
                'cashflow_category_id' => $faker->randomElement($categories),
                'created_id' => $faker->randomElement($users),
                'invoice_id' => $faker->optional(0.7)->randomElement($invoices),
                'amount' => $faker->numberBetween(50000, 10000000),
                'note' => $faker->optional()->sentence(),
                'created_at' => $faker->dateTimeBetween('-1 year', 'now'),
                'updated_at' => now(),
            ];
        }

        DB::table('cashflows')->insert($data);
    }
}
