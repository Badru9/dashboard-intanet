<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Customer;
use App\Models\CustomersOffline;
use Carbon\Carbon;

class CustomersOfflineSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Pastikan ada customer di database dulu
        $customers = Customer::all();

        if ($customers->isEmpty()) {
            $this->command->info('No customers found. Please seed customers first.');
            return;
        }

        $currentDate = Carbon::now();

        // Sample data customers offline
        $offlineData = [
            // Customer yang masih offline (to = null)
            [
                'customer_id' => $customers->random()->id,
                'from' => $currentDate->copy()->subDays(10)->toDateString(),
                'to' => null,
            ],
            [
                'customer_id' => $customers->random()->id,
                'from' => $currentDate->copy()->subDays(5)->toDateString(),
                'to' => null,
            ],
            [
                'customer_id' => $customers->random()->id,
                'from' => $currentDate->copy()->subDays(3)->toDateString(),
                'to' => null,
            ],

            // Customer yang sudah kembali online (to diisi)
            [
                'customer_id' => $customers->random()->id,
                'from' => $currentDate->copy()->subDays(15)->toDateString(),
                'to' => $currentDate->copy()->subDays(12)->toDateString(),
            ],
            [
                'customer_id' => $customers->random()->id,
                'from' => $currentDate->copy()->subDays(20)->toDateString(),
                'to' => $currentDate->copy()->subDays(18)->toDateString(),
            ],
            [
                'customer_id' => $customers->random()->id,
                'from' => $currentDate->copy()->subDays(30)->toDateString(),
                'to' => $currentDate->copy()->subDays(25)->toDateString(),
            ],

            // Data bulan sebelumnya
            [
                'customer_id' => $customers->random()->id,
                'from' => $currentDate->copy()->subMonth()->subDays(10)->toDateString(),
                'to' => $currentDate->copy()->subMonth()->subDays(5)->toDateString(),
            ],
            [
                'customer_id' => $customers->random()->id,
                'from' => $currentDate->copy()->subMonth()->subDays(20)->toDateString(),
                'to' => $currentDate->copy()->subMonth()->subDays(15)->toDateString(),
            ],
        ];

        foreach ($offlineData as $data) {
            CustomersOffline::create($data);
        }

        // Generate random data untuk customer lainnya
        $remainingCustomers = $customers->skip(count($offlineData));

        foreach ($remainingCustomers->take(10) as $customer) {
            // Random chance untuk offline
            if (rand(1, 100) <= 30) { // 30% chance offline
                $fromDate = $currentDate->copy()->subDays(rand(1, 60));
                $toDate = rand(1, 100) <= 60 ? $fromDate->copy()->addDays(rand(1, 10)) : null; // 60% chance sudah online kembali

                CustomersOffline::create([
                    'customer_id' => $customer->id,
                    'from' => $fromDate->toDateString(),
                    'to' => $toDate ? $toDate->toDateString() : null,
                ]);
            }
        }
    }
}
