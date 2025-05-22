<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Cashflow;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DataController extends Controller
{
    //

    public function getDashboardData()
    {

        $totalIncome = Invoice::sum('total_amount');
        $totalTransaction = Invoice::count();

        $data = [
            'total_pendapatan' => $totalIncome,
            'total_transaksi' => $totalTransaction,
        ];

        return Inertia::render('Dashboard', [
            'data' => $data,
        ]);
    }

    public function getChartData(Request $request)
    {
        try {
            $currentDate = Carbon::now();
            $selectedYear = $request->input('year', $currentDate->format('Y'));
            $selectedMonth = $request->input('month', $currentDate->format('m'));
            $startOfMonth = Carbon::createFromDate($selectedYear, $selectedMonth, 1);
            $endOfMonth = $startOfMonth->copy()->endOfMonth();
            // Target: Total tagihan dari customer online per bulan
            $targetQuery = Invoice::selectRaw('MONTH(due_date) as month, SUM(total_amount) as total')
                ->whereBetween('due_date', [$startOfMonth, $endOfMonth])
                ->whereHas('customer', function ($q) {
                    $q->where('status', 'online');
                })
                ->groupBy('month')
                ->orderBy('month')
                ->get();

            $targetData = array_fill(0, 12, 0);
            foreach ($targetQuery as $data) {
                $targetData[$data->month - 1] = $data->total;
            }

            // Realisasi: Uang masuk ke cashflow (is_out = 0) per bulan
            $incomeQuery = Cashflow::selectRaw('MONTH(date) as month, SUM(amount) as total')
                ->whereBetween('date', [$startOfMonth, $endOfMonth])
                ->whereHas('category', function ($q) {
                    $q->where('is_out', 0);
                })
                ->groupBy('month')
                ->orderBy('month')
                ->get();

            $incomeData = array_fill(0, 12, 0);
            foreach ($incomeQuery as $data) {
                $incomeData[$data->month - 1] = $data->total;
            }

            $labels = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

            $chartData = [
                'labels' => $labels,
                'datasets' => [
                    [
                        'label' => 'Target Pendapatan',
                        'data' => $targetData,
                        'borderColor' => 'rgb(75, 192, 192)',
                        'backgroundColor' => 'rgba(75, 192, 192, 0.5)',
                        'tension' => 0.4,
                        'cubicInterpolationMode' => 'monotone',
                        'fill' => false,
                    ],
                    [
                        'label' => 'Realisasi Pendapatan',
                        'data' => $incomeData,
                        'borderColor' => 'rgb(255, 99, 132)',
                        'backgroundColor' => 'rgba(255, 99, 132, 0.5)',
                        'tension' => 0.4,
                        'cubicInterpolationMode' => 'monotone',
                        'fill' => false,
                    ],
                ],
            ];

            return response()->json($chartData);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getOutcomeChartData(Request $request)
    {
        try {
            $currentDate = Carbon::now();
            $selectedYear = $request->input('year', $currentDate->format('Y'));
            $selectedMonth = $request->input('month', $currentDate->format('m'));

            $query = Cashflow::selectRaw('cashflow_category_id, SUM(amount) as total')
                ->whereYear('date', $selectedYear)
                ->whereMonth('date', $selectedMonth)
                ->whereHas('category', function ($q) {
                    $q->where('is_out', 1);
                })
                ->groupBy('cashflow_category_id')
                ->with('category')
                ->get();

            $labels = [];
            $data = [];
            $backgroundColors = [];
            $colorPalette = [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4BC0C0',
                '#9966FF',
                '#FF9F40',
                '#C9CBCF',
                '#B4FF9F',
                '#FFB4B4',
                '#B4D4FF',
                '#FFD6A5',
                '#A5FFD6'
            ];
            $i = 0;
            foreach ($query as $item) {
                $labels[] = $item->category->name ?? 'Lainnya';
                $data[] = $item->total;
                $backgroundColors[] = $colorPalette[$i % count($colorPalette)];
                $i++;
            }

            $chartData = [
                'labels' => $labels,
                'datasets' => [
                    [
                        'data' => $data,
                        'backgroundColor' => $backgroundColors,
                        'borderColor' => '#fff',
                        'borderWidth' => 2,
                    ]
                ]
            ];

            return response()->json($chartData);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
