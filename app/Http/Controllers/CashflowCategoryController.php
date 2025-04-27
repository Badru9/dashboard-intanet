<?php

namespace App\Http\Controllers;

use App\Models\CashflowCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CashflowCategoryController extends Controller
{
    public function index()
    {
        $categories = CashflowCategory::whereNull('deleted_at')->paginate(10);
        return inertia('CashflowCategories/Index', [
            'categories' => $categories
        ]);
    }

    public function create()
    {
        $categories = CashflowCategory::all();

        return inertia('CashflowCategories/Create', [
            'categories' => $categories
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'is_out' => 'required|in:0,1',
            'note' => 'nullable|string',
        ]);

        CashflowCategory::create($validated);

        return redirect()->route('cashflow-categories.index')
            ->with('message', 'Category created successfully.');
    }

    public function edit(CashflowCategory $cashflow_category)
    {
        return inertia('CashflowCategories/Edit', [
            'cashflow_category' => $cashflow_category
        ]);
    }

    public function update(Request $request, CashflowCategory $cashflow_category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'is_out' => 'required|in:0,1',
            'note' => 'nullable|string',
        ]);

        Log::info($cashflow_category, $request->all());

        $cashflow_category->update($validated);

        return redirect()->route('cashflow-categories.index')
            ->with('message', 'Kategori berhasil diubah.');
    }

    public function destroy(CashflowCategory $cashflow_category)
    {
        $cashflow_category->delete();

        Log::info('Kategori berhasil dihapus: ' . $cashflow_category);

        return redirect()->route('cashflow-categories.index')
            ->with('message', 'Kategori berhasil dihapus.');
    }
}
