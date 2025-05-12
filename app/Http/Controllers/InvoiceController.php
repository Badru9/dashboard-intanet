<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\InternetPackage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

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
            'period' => 'required|date_format:Y-m',
        ]);

        $periodDate = Carbon::createFromFormat('Y-m', $validated['period']);

        // Ambil semua customer yang aktif
        $activeCustomers = Customer::with('package')
            ->where('status', 'active')
            ->get();

        Log::info('activeCustomers' . $activeCustomers);

        $createdCount = 0;
        $errors = [];

        foreach ($activeCustomers as $customer) {
            try {
                // Hitung due date berdasarkan bill_date customer
                $billDate = Carbon::parse($customer->bill_date);
                $dueDate = Carbon::create(
                    $periodDate->year,
                    $periodDate->month,
                    $billDate->day
                );

                // Cek apakah invoice untuk periode ini sudah ada
                $existingInvoice = Invoice::where('customer_id', $customer->id)
                    ->whereYear('period', $periodDate->year)
                    ->whereMonth('period', $periodDate->month)
                    ->first();

                if (!$existingInvoice) {
                    Invoice::create([
                        'customer_id' => $customer->id,
                        'package_id' => $customer->package_id,
                        'amount' => $customer->package->price,
                        'status' => 'unpaid',
                        'due_date' => $dueDate,
                        'period' => $periodDate,
                        'created_by' => Auth::id(),
                    ]);
                    $createdCount++;
                }
            } catch (\Exception $e) {
                $errors[] = "Gagal membuat invoice untuk customer {$customer->name}: " . $e->getMessage();
            }
        }

        $message = "Berhasil membuat {$createdCount} invoice baru.";
        if (count($errors) > 0) {
            $message .= " Terdapat " . count($errors) . " error.";
            Log::error('Invoice generation errors:', $errors);
        }

        return redirect()->route('invoices.index')
            ->with('message', $message);
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
