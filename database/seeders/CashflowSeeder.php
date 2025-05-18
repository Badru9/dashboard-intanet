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

        // Ambil ID kategori subscription
        $subscriptionCategoryId = DB::table('cashflow_categories')
            ->where('name', 'like', '%subscription%')
            ->pluck('id')
            ->first();

        $data = [];
        foreach (range(1, 50) as $i) {
            $date = $faker->dateTimeBetween('-1 year', 'now');

            // Tentukan apakah ini adalah cashflow subscription
            $isSubscription = $faker->boolean(30); // 30% kemungkinan adalah subscription

            $data[] = [
                'cashflow_category_id' => $isSubscription ? $subscriptionCategoryId : $faker->randomElement($categories),
                'created_id' => $faker->randomElement($users),
                'customer_id' => $faker->randomElement($customers),
                'invoice_id' => $isSubscription ? $faker->randomElement($invoices) : null,
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
