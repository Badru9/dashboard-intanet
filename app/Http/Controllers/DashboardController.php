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

            // Pastikan format bulan 2 digit
            $selectedMonth = str_pad($selectedMonth, 2, '0', STR_PAD_LEFT);

            // Buat tanggal awal dan akhir bulan
            $date = Carbon::createFromFormat('Y-m', $selectedYear . '-' . $selectedMonth);
            $startOfMonth = $date->copy()->startOfMonth();
            $endOfMonth = $date->copy()->endOfMonth();

            // Total Pelanggan Aktif (berdasarkan bulan yang dipilih)
            $activeCustomers = Customer::where('status', 'online')
                ->whereBetween('join_date', [$startOfMonth, $endOfMonth])
                ->count();

            // Total Pendapatan Bulan Ini
            $monthlyIncome = Cashflow::where('cashflow_category_id', function ($query) {
                $query->select('id')
                    ->from('cashflow_categories')
                    ->where('is_out', 0)
                    ->first();
            })
                ->whereBetween('date', [$startOfMonth, $endOfMonth])
                ->sum('amount');

            // Total Pengeluaran Bulan Ini
            $monthlyExpense = Cashflow::where('cashflow_category_id', function ($query) {
                $query->select('id')
                    ->from('cashflow_categories')
                    ->where('is_out', 1)
                    ->first();
            })
                ->whereBetween('date', [$startOfMonth, $endOfMonth])
                ->sum('amount');

            // Pendapatan Belum Masuk (Tagihan yang belum dibayar bulan ini)
            $unpaidInvoices = Invoice::where('status', 'unpaid')
                ->whereBetween('due_date', [$startOfMonth, $endOfMonth])
                ->sum('total_amount');

            Log::info('Dashboard Query:', [
                'month' => $selectedMonth,
                'year' => $selectedYear,
                'startOfMonth' => $startOfMonth->format('Y-m-d'),
                'endOfMonth' => $endOfMonth->format('Y-m-d'),
                'activeCustomers' => $activeCustomers,
                'monthlyIncome' => $monthlyIncome,
                'monthlyExpense' => $monthlyExpense,
                'unpaidInvoices' => $unpaidInvoices
            ]);

            return Inertia::render('Dashboard', [
                'activeCustomers' => $activeCustomers,
                'monthlyIncome' => $monthlyIncome,
                'monthlyExpense' => $monthlyExpense,
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
                'activeCustomers' => 0,
                'monthlyIncome' => 0,
                'monthlyExpense' => 0,
                'unpaidInvoices' => 0,
                'selectedMonth' => $currentDate->format('m'),
                'selectedYear' => $currentDate->format('Y'),
            ]);
        }
    }
}
