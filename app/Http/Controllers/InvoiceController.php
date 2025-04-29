<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\InternetPackage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class InvoiceController extends Controller
{
    public function index()
    {
        $invoices = Invoice::with(['customer', 'package', 'creator'])
            ->whereNull('deleted_at')
            ->latest()
            ->paginate(10);

        $packages = InternetPackage::all();

        return inertia('Invoices/Index', [
            'invoices' => $invoices,
            'packages' => $packages,
            'customers' => Customer::with('package')->get()
        ]);
    }

    public function create()
    {
        return inertia('Invoices/Create', [
            'customers' => Customer::with('package')
                ->where('status', 'active')
                ->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'period' => 'required|date_format:Y-m',
            'note' => 'nullable|string',
        ]);

        $customer = Customer::with('package')->findOrFail($validated['customer_id']);

        // Hitung due date berdasarkan active_date customer
        $activeDate = Carbon::parse($customer->active_date);
        $periodDate = Carbon::createFromFormat('Y-m', $validated['period']);
        $dueDate = Carbon::create(
            $periodDate->year,
            $periodDate->month,
            $activeDate->day
        );

        Invoice::create([
            'customer_id' => $customer->id,
            'package_id' => $customer->package_id,
            'amount' => $customer->package->price,
            'status' => 'unpaid',
            'due_date' => $dueDate,
            'period' => $periodDate,
            'note' => $validated['note'],
            'created_by' => Auth::id(),
        ]);

        return redirect()->route('invoices.index')
            ->with('message', 'Invoice created successfully.');
    }

    public function edit(Invoice $invoice)
    {
        $invoice->load(['customer', 'package', 'creator']);

        $customers = Customer::with('package')->get();
        $packages = InternetPackage::all();

        return inertia('Invoices/Edit', [
            'invoice' => $invoice,
            'customers' => $customers,
            'packages' => $packages,
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
