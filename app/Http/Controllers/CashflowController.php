<?php

namespace App\Http\Controllers;

use App\Models\Cashflow;
use App\Models\CashflowCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CashflowController extends Controller
{
    public function index()
    {
        $cashflows = Cashflow::with(['category'])->get();
        return inertia('Cashflows/Index', [
            'cashflows' => $cashflows
        ]);
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
