<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\InternetPackage;
use App\Models\Setting;
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

        // Ambil nilai PPN dari settings (dalam bentuk persentase)
        $ppn = (float)Setting::where('key', 'ppn')->first()?->value ?? 0;

        // Buat 20 invoice dummy
        for ($i = 0; $i < 20; $i++) {
            $customer = $customers->random();
            $package = $packages->random();
            $user = $users->random();

            // Generate tanggal jatuh tempo (antara 1-30 hari dari sekarang)
            $dueDate = now()->addDays(rand(1, 30));

            // Hitung total amount dengan PPN
            $amount = $package->price;
            $ppnAmount = round(($amount * $ppn) / 100, 2); // Hitung PPN dari amount
            $totalAmount = $amount + $ppnAmount;

            // Generate payment proof path hanya untuk invoice yang sudah dibayar
            $status = fake()->randomElement(['paid', 'unpaid', 'cancelled']);
            $paymentProofPath = $status === 'paid' ? 'payment_proofs/invoice_' . fake()->uuid() . '.jpg' : null;

            Invoice::create([
                'customer_id' => $customer->id,
                'invoice_id' => Invoice::generateInvoiceId(),
                'package_id' => $package->id,
                'created_by' => $user->id,
                'amount' => $amount,
                'total_amount' => $totalAmount,
                'ppn' => $ppn, // Simpan nilai persentase PPN
                'status' => $status,
                'due_date' => $dueDate,
                'period_month' => $dueDate->format('m'),
                'period_year' => $dueDate->format('Y'),
                'note' => fake()->optional(0.7)->sentence(), // 70% kemungkinan ada note
                'payment_proof_path' => $paymentProofPath,
            ]);
        }
    }
}
