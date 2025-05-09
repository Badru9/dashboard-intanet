<?php

namespace App\Http\Controllers;

use App\Models\Cashflow;
use App\Models\CashflowCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class CashflowController extends Controller
{
    public function index()
    {
        try {
            // Mulai dengan query base
            $query = Cashflow::query()
                ->with(['category', 'creator', 'invoice']);

            // Log untuk melihat request yang masuk
            Log::info('Request Data:', [
                'category' => request()->category,
                'date_range' => request()->date_range
            ]);

            // Filter berdasarkan kategori
            if (request()->filled('category') && request()->category !== 'all') {
                $query->where('cashflow_category_id', request()->category);
            }

            // Filter berdasarkan tanggal
            if (request()->filled('date_range')) {
                $query->whereBetween('date', [
                    request()->date_range['startDate'],
                    request()->date_range['endDate']
                ]);
            }

            // Debug query yang dihasilkan
            Log::info('Query Debug:', [
                'sql' => $query->toSql(),
                'bindings' => $query->getBindings(),
                'count' => $query->count() // Cek jumlah data sebelum paginasi
            ]);

            // Eksekusi query dengan paginasi
            $cashflows = $query->orderBy('date', 'desc')->paginate(10);

            // Debug hasil akhir
            Log::info('Final Result:', [
                'total_data' => $cashflows->total(),
                'current_page' => $cashflows->currentPage(),
                'per_page' => $cashflows->perPage()
            ]);

            return inertia('Cashflows/Index', [
                'cashflows' => $cashflows,
                'categories' => CashflowCategory::all(),
                'filters' => [
                    'category' => request()->category,
                    'date_range' => request()->date_range
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error in Cashflow Index:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->with('error', 'Terjadi kesalahan saat memuat data.');
        }
    }

    public function create()
    {
        return inertia('Cashflows/Create', [
            'categories' => CashflowCategory::all()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'cashflow_category_id' => 'required|exists:cashflow_categories,id',
            'date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'note' => 'nullable|string',
        ]);

        $validated['created_id'] = Auth::id();

        Cashflow::create($validated);

        return redirect()->route('cashflows.index')
            ->with('message', 'Cashflow created successfully.');
    }

    public function edit(Cashflow $cashflow)
    {
        return inertia('Cashflows/Edit', [
            'cashflow' => $cashflow->load('category'),
            'categories' => CashflowCategory::all()
        ]);
    }

    public function update(Request $request, Cashflow $cashflow)
    {
        $validated = $request->validate([
            'cashflow_category_id' => 'required|exists:cashflow_categories,id',
            'date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'note' => 'nullable|string',
        ]);

        $cashflow->update($validated);

        return redirect()->route('cashflows.index')
            ->with('message', 'Cashflow updated successfully.');
    }

    public function destroy(Cashflow $cashflow)
    {
        $cashflow->delete();

        return redirect()->route('cashflows.index')
            ->with('message', 'Cashflow deleted successfully.');
    }
}
