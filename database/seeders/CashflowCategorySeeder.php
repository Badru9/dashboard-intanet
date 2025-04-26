<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CashflowCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Subscription', 'is_out' => '0', 'note' => 'Langganan bulanan', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Equipment', 'is_out' => '1', 'note' => 'Pembelian alat', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Maintenance', 'is_out' => '1', 'note' => 'Perawatan jaringan', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Service', 'is_out' => '0', 'note' => 'Jasa pemasangan', 'created_at' => now(), 'updated_at' => now()],
        ];

        foreach ($categories as $cat) {
            DB::table('cashflow_categories')->insert($cat);
        }
    }
}
