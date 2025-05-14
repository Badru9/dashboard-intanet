<?php

namespace Database\Seeders;

use App\Models\Cashflow;
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
        $customers = DB::table('customers')->pluck('id')->toArray();

        $data = [];
        foreach (range(1, 50) as $i) {
            $date = $faker->dateTimeBetween('-1 year', 'now');

            $data[] = [
                'cashflow_category_id' => $faker->randomElement($categories),
                'created_id' => $faker->randomElement($users),
                'customer_id' => $faker->randomElement($customers),
                'invoice_id' => $faker->optional(0.7)->randomElement($invoices),
                'date' => $date->format('Y-m-d'),
                'amount' => $faker->numberBetween(50000, 10000000),
                'note' => $faker->optional()->sentence(),
                'created_at' => $date,
                'updated_at' => now(),
            ];
        }

        Cashflow::insert($data);
    }
}
