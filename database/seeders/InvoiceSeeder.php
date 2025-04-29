<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\InternetPackage;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InvoiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Hapus data yang ada sebelumnya dengan aman
        DB::table('cashflows')->where('invoice_id', '!=', null)->delete();
        DB::table('invoices')->delete();

        // Ambil semua customer dan package yang ada
        $customers = Customer::all();
        $packages = InternetPackage::all();
        $users = User::all();

        // Buat 20 invoice dummy
        for ($i = 0; $i < 20; $i++) {
            $customer = $customers->random();
            $package = $packages->random();
            $user = $users->random();

            // Generate tanggal jatuh tempo (antara 1-30 hari dari sekarang)
            $dueDate = now()->addDays(rand(1, 30));

            Invoice::create([
                'customer_id' => $customer->id,
                'package_id' => $package->id,
                'created_by' => $user->id,
                'amount' => $package->price,
                'status' => fake()->randomElement(['paid', 'unpaid', 'cancelled']),
                'due_date' => $dueDate,
                'note' => fake()->optional(0.7)->sentence(), // 70% kemungkinan ada note
            ]);
        }
    }
}
