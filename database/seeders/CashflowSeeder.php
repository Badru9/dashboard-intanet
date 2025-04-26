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
        $categories = DB::table('cashflow_categories')->pluck('id', 'name');

        // $data = [
        //     [
        //         'amount' => 4999000,
        //         'cashflow_category_id' => $categories['Subscription'],
        //         'note' => 'From 5 customers',
        //         'created_at' => now(),
        //         'updated_at' => now(),
        //     ],
        //     [
        //         'amount' => 2500000,
        //         'cashflow_category_id' => $categories['Equipment'],
        //         'note' => null,
        //         'created_at' => now(),
        //         'updated_at' => now(),
        //     ],
        //     [
        //         'amount' => 1500000,
        //         'cashflow_category_id' => $categories['Maintenance'],
        //         'note' => null,
        //         'created_at' => now(),
        //         'updated_at' => now(),
        //     ],
        //     [
        //         'amount' => 1000000,
        //         'cashflow_category_id' => $categories['Service'],
        //         'note' => null,
        //         'created_at' => now(),
        //         'updated_at' => now(),
        //     ],
        // ];

        foreach (range(1, 50) as $i) {
            $data[] = [
                'amount' => $faker->numberBetween(50000, 10000000),
                'cashflow_category_id' => $faker->randomElement($categories),
                'note' => $faker->optional()->sentence(),
                'created_at' => $faker->dateTimeBetween('-1 year', 'now'),
                'updated_at' => now(),
            ];
        }

        DB::table('cashflows')->insert($data);
    }
}
