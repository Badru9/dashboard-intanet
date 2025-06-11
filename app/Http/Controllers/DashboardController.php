<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Cashflow;
use App\Models\CustomersOffline;
use App\Models\Invoice;
use App\Models\Setting;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        try {
            $currentDate = Carbon::now();
            $selectedMonth = $request->input('month', $currentDate->format('m'));
            $selectedYear = $request->input('year', $currentDate->format('Y'));

            Log::info('Selected Month:', ['month' => $selectedMonth]);
            Log::info('Selected Year:', ['year' => $selectedYear]);

            // Format bulan 2 digit
            $selectedMonth = str_pad($selectedMonth, 2, '0', STR_PAD_LEFT);

            // Tanggal awal dan akhir bulan yang dipilih
            $date = Carbon::create($selectedYear, (int)$selectedMonth, 1);
            $startOfMonth = $date->copy()->startOfMonth();
            $endOfMonth = $date->copy()->endOfMonth();

            // Ambil setting PPN dengan error handling
            $ppnSetting = Setting::where('key', 'ppn')->first();
            $ppnRate = $ppnSetting ? (float)$ppnSetting->value : 0; // FIX: Cast ke float

            // Target: Total semua customer online dengan PPN
            $totalPackagePrice = Customer::join('internet_packages', 'customers.package_id', '=', 'internet_packages.id')
                ->where('customers.status', 'online')
                ->sum('internet_packages.price');
            $target = $totalPackagePrice * (1 + ($ppnRate / 100));

            // Target Monthly: Customer yang join bulan ini dengan PPN
            $totalPackagePriceMonthly = Customer::join('internet_packages', 'customers.package_id', '=', 'internet_packages.id')
                ->where('customers.status', 'online')
                ->whereBetween('customers.join_date', [$startOfMonth, $endOfMonth])
                ->sum('internet_packages.price');
            $targetMonthly = $totalPackagePriceMonthly * (1 + ($ppnRate / 100));

            $onlineCustomers = CustomersOffline::whereBetween('to', [$startOfMonth, $endOfMonth])->count();

            $monthlyIncome = Cashflow::whereHas('category', function ($q) {
                $q->where('is_out', 0);
            })
                ->whereBetween('date', [$startOfMonth, $endOfMonth])
                ->sum('amount');

            $monthlyExpense = Cashflow::whereHas('category', function ($q) {
                $q->where('is_out', 1);
            })
                ->whereBetween('date', [$startOfMonth, $endOfMonth])
                ->sum('amount');

            // Pendapatan Belum Masuk
            $unpaidInvoices = Invoice::where('status', 'unpaid')
                ->whereBetween('due_date', [$startOfMonth, $endOfMonth])
                ->sum('total_amount');

            Log::info('Dashboard Query:', [
                'month' => $selectedMonth,
                'year' => $selectedYear,
                'startOfMonth' => $startOfMonth->format('Y-m-d'),
                'endOfMonth' => $endOfMonth->format('Y-m-d'),
                'ppnRate' => $ppnRate,
                'totalPackagePrice' => $totalPackagePrice,
                'target' => $target,
                'targetMonthly' => $targetMonthly,
                'monthlyIncome' => $monthlyIncome,
                'monthlyExpense' => $monthlyExpense,
                'onlineCustomers' => $onlineCustomers,
                'unpaidInvoices' => $unpaidInvoices
            ]);

            return Inertia::render('Dashboard', [
                'target' => $target,
                'targetMonthly' => $targetMonthly, // FIX: Tambahkan target monthly
                'monthlyIncome' => $monthlyIncome,
                'monthlyExpense' => $monthlyExpense,
                'onlineCustomers' => $onlineCustomers,
                'unpaidInvoices' => $unpaidInvoices,
                'selectedMonth' => $selectedMonth,
                'selectedYear' => $selectedYear,
                'ppnRate' => $ppnRate, // FIX: Kirim PPN rate ke frontend
            ]);
        } catch (\Exception $e) {
            Log::error('Dashboard Error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            // Mengembalikan nilai default jika terjadi kesalahan
            return Inertia::render('Dashboard', [
                'target' => 0,
                'targetMonthly' => 0,
                'monthlyIncome' => 0,
                'monthlyExpense' => 0,
                'unpaidInvoices' => 0,
                'onlineCustomers' => 0,
                'selectedMonth' => $currentDate->format('m'),
                'selectedYear' => $currentDate->format('Y'),
                'ppnRate' => 0,
            ]);
        }
    }
}
