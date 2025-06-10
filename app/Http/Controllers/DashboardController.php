<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Cashflow;
use App\Models\CustomersOffline;
use App\Models\Invoice;
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

            // Target: Semua cashflow pemasukan (is_out = 0) bulan ini
            $target = Cashflow::whereHas('category', function ($q) {
                $q->where('is_out', 0);
            })
                ->whereBetween('date', [$startOfMonth, $endOfMonth])
                ->sum('amount');


            $onlineCustomers = CustomersOffline::whereBetween('to', [$startOfMonth, $endOfMonth])->count();

            // Realisasi: Semua cashflow pemasukan (is_out = 0) bulan ini
            $monthlyIncome = $target;

            // Pengeluaran: Semua cashflow pengeluaran (is_out = 1) bulan ini
            $monthlyExpense = Cashflow::whereHas('category', function ($q) {
                $q->where('is_out', 1);
            })
                ->whereBetween('date', [$startOfMonth, $endOfMonth])
                ->sum('amount');

            // Pendapatan Belum Masuk (jika tetap ingin dari invoice)
            $unpaidInvoices = Invoice::where('status', 'unpaid')
                ->whereBetween('due_date', [$startOfMonth, $endOfMonth])
                ->sum('total_amount');

            Log::info('Dashboard Query:', [
                'month' => $selectedMonth,
                'year' => $selectedYear,
                'startOfMonth' => $startOfMonth->format('Y-m-d'),
                'endOfMonth' => $endOfMonth->format('Y-m-d'),
                'target' => $target,
                'monthlyIncome' => $monthlyIncome,
                'monthlyExpense' => $monthlyExpense,
                'onlineCustomers' => $onlineCustomers,
                'unpaidInvoices' => $unpaidInvoices
            ]);

            return Inertia::render('Dashboard', [
                'target' => $target,
                'monthlyIncome' => $monthlyIncome,
                'monthlyExpense' => $monthlyExpense,
                'onlineCustomers' => $onlineCustomers,
                'unpaidInvoices' => $unpaidInvoices,
                'selectedMonth' => $selectedMonth,
                'selectedYear' => $selectedYear,
            ]);
        } catch (\Exception $e) {
            Log::error('Dashboard Error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Mengembalikan nilai default jika terjadi kesalahan
            return Inertia::render('Dashboard', [
                'target' => 0,
                'monthlyIncome' => 0,
                'monthlyExpense' => 0,
                'unpaidInvoices' => 0,
                'onlineCustomers' => 0,
                'selectedMonth' => $currentDate->format('m'),
                'selectedYear' => $currentDate->format('Y'),
            ]);
        }
    }
}
