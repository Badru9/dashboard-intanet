<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Cashflow;
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

            // Tanggal awal dan akhir bulan
            $date = Carbon::createFromFormat('Y-m', $selectedYear . '-' . $selectedMonth);
            $startOfMonth = $date->copy()->startOfMonth();
            $endOfMonth = $date->copy()->endOfMonth();

            // Target: Semua cashflow pemasukan (is_out = 0) bulan ini
            $target = Cashflow::whereHas('category', function ($q) {
                $q->where('is_out', 0);
            })
                ->whereBetween('date', [$startOfMonth, $endOfMonth])
                ->sum('amount');

            $onlineCustomers = Customer::where('status', 'online')
                ->whereDate('join_date', '<=', $date)
                ->count();

            // Realisasi: Semua cashflow pemasukan (is_out = 0) bulan ini (bisa tambahkan filter lain jika perlu)
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

            // Return default values if there's an error
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
