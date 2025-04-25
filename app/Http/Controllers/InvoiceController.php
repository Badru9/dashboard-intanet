<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\InternetPackage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class InvoiceController extends Controller
{
    public function index()
    {
        $invoices = Invoice::with(['customer', 'package', 'creator'])
            ->latest()
            ->paginate(15);

        return inertia('Invoices/Index', [
            'invoices' => $invoices
        ]);
    }

    public function create()
    {
        return inertia('Invoices/Create', [
            'customers' => Customer::with('package')->get(),
            'packages' => InternetPackage::all()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'package_id' => 'required|exists:internet_packages,id',
            'amount' => 'required|numeric|min:0',
            'status' => 'required|in:unpaid,paid,cancelled',
            'due_date' => 'required|date',
            'note' => 'nullable|string',
        ]);

        $validated['created_id'] = Auth::id();

        Invoice::create($validated);

        return redirect()->route('invoices.index')
            ->with('message', 'Invoice created successfully.');
    }

    public function edit(Invoice $invoice)
    {
        return inertia('Invoices/Edit', [
            'invoice' => $invoice->load(['customer', 'package']),
            'customers' => Customer::with('package')->get(),
            'packages' => InternetPackage::all()
        ]);
    }

    public function update(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'package_id' => 'required|exists:internet_packages,id',
            'amount' => 'required|numeric|min:0',
            'status' => 'required|in:unpaid,paid,cancelled',
            'due_date' => 'required|date',
            'note' => 'nullable|string',
        ]);

        $invoice->update($validated);

        return redirect()->route('invoices.index')
            ->with('message', 'Invoice updated successfully.');
    }

    public function destroy(Invoice $invoice)
    {
        $invoice->delete();

        return redirect()->route('invoices.index')
            ->with('message', 'Invoice deleted successfully.');
    }

    public function markAsPaid(Invoice $invoice)
    {
        $invoice->update(['status' => 'paid']);

        return back()->with('message', 'Invoice marked as paid successfully.');
    }

    public function markAsUnpaid(Invoice $invoice)
    {
        $invoice->update(['status' => 'unpaid']);

        return back()->with('message', 'Invoice marked as unpaid successfully.');
    }

    public function markAsCancelled(Invoice $invoice)
    {
        $invoice->update(['status' => 'cancelled']);

        return back()->with('message', 'Invoice marked as cancelled successfully.');
    }
}
