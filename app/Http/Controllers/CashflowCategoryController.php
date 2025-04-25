<?php

namespace App\Http\Controllers;

use App\Models\CashflowCategory;
use Illuminate\Http\Request;

class CashflowCategoryController extends Controller
{
    public function index()
    {
        $categories = CashflowCategory::all();
        return inertia('CashflowCategories/Index', [
            'categories' => $categories
        ]);
    }

    public function create()
    {
        return inertia('CashflowCategories/Create');
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

    public function edit(CashflowCategory $category)
    {
        return inertia('CashflowCategories/Edit', [
            'category' => $category
        ]);
    }

    public function update(Request $request, CashflowCategory $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'is_out' => 'required|in:0,1',
            'note' => 'nullable|string',
        ]);

        $category->update($validated);

        return redirect()->route('cashflow-categories.index')
            ->with('message', 'Category updated successfully.');
    }

    public function destroy(CashflowCategory $category)
    {
        $category->delete();

        return redirect()->route('cashflow-categories.index')
            ->with('message', 'Category deleted successfully.');
    }
}
