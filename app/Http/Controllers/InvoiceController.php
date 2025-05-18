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
use App\Models\Setting;
use App\Models\Cashflow;
use App\Models\CashflowCategory;

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
                ->where('status', 'online')
                ->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'period_month' => 'required|integer|min:1|max:12',
            'period_year' => 'required|integer|min:2000',
        ]);

        $periodMonth = (int) $validated['period_month'];
        $periodYear = (int) $validated['period_year'];

        Log::info('validated period' . $periodMonth . ' ' . $periodYear);

        // Ambil nilai PPN dari settings
        $ppnSetting = Setting::where('key', 'ppn')->first();
        $ppn = $ppnSetting ? (float)$ppnSetting->value : 11;

        // Ambil semua customer yang aktif
        $activeCustomers = Customer::with('package')
            ->where('status', 'online')
            ->get();

        Log::info('active customers', $activeCustomers->toArray());


        $createdCount = 0;
        $errors = [];

        foreach ($activeCustomers as $customer) {
            try {
                // Hitung due date berdasarkan bill_date customer
                $billDay = (int) $customer->bill_date;
                $joinDate = Carbon::parse($customer->join_date);

                // Buat due date berdasarkan join_date (bulan dan tahun) dan bill_date (tanggal)
                $dueDate = Carbon::create(
                    $joinDate->year,
                    $joinDate->month,
                    $billDay
                );

                // Pengecekan: status harus online
                if ($customer->status !== 'online') {
                    continue;
                }

                if ($customer->bill_date == '') {
                    continue;
                }


                // Cek apakah customer join di bulan yang dipilih
                // Jika join_date adalah bulan Mei, maka tidak boleh digenerate invoice untuk bulan Juni
                if ($joinDate->month != $periodMonth) {
                    continue;
                }

                // Cek apakah invoice untuk periode ini sudah ada
                $existingInvoice = Invoice::where('customer_id', $customer->id)
                    ->where('period_month', $periodMonth)
                    ->where('period_year', $periodYear)
                    ->first();

                Log::info('existing invoice ' . $existingInvoice);


                if (!$existingInvoice) {
                    $amount = $customer->package->price;
                    $totalAmount = $amount + ($amount * $ppn / 100);

                    // Hitung jumlah invoice di bulan & tahun yang sama
                    $lastInvoice = Invoice::where('period_year', $periodYear)
                        ->where('period_month', $periodMonth)
                        ->orderByDesc('invoice_id')
                        ->first();

                    if ($lastInvoice && preg_match('/INV\/\d{6}\/(\d{4})$/', $lastInvoice->invoice_id, $matches)) {
                        $increment = (int)$matches[1] + 1;
                    } else {
                        $increment = 1;
                    }
                    $invoiceId = sprintf('INV/%04d%02d/%04d', $periodYear, $periodMonth, $increment);

                    Invoice::create([
                        'customer_id' => $customer->id,
                        'package_id' => $customer->package_id,
                        'amount' => $amount,
                        'ppn' => $ppn,
                        'total_amount' => $totalAmount,
                        'status' => 'unpaid',
                        'due_date' => $dueDate,
                        'period_month' => $periodMonth,
                        'period_year' => $periodYear,
                        'created_by' => Auth::id(),
                        'invoice_id' => $invoiceId,
                    ]);
                    $createdCount++;
                }
            } catch (\Exception $e) {
                $errors[] = "Gagal membuat invoice untuk customer {$customer->name}: " . $e->getMessage();
            }
        }

        Log::info('created count' . $createdCount);
        Log::info('errors' . json_encode($errors));

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

    public function markAsPaid(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            // 'payment_proof' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'note' => 'nullable|string',
            'paid_at' => 'required|date',
        ]);


        // if ($request->hasFile('payment_proof')) {
        //     $path = $request->file('payment_proof')->store('payment_proofs', 'public');
        //     $validated['payment_proof_path'] = $path;
        // }

        Log::info('validated invoice', $invoice->toArray());

        $invoice->status = 'paid';
        $invoice->note = $validated['note'] ?? null;
        $invoice->paid_at = $validated['paid_at'];
        // if (isset($validated['payment_proof_path'])) {
        //     $invoice->payment_proof_path = $validated['payment_proof_path'];
        // }
        $invoice->save();

        if ($invoice->status === 'paid') {

            Cashflow::create([
                'cashflow_category_id' =>  null,
                'date' => now(),
                'created_id' => Auth::id(),
                'amount' => $invoice->total_amount,
                'note' => 'Pembayaran invoice ' . $invoice->invoice_id,
                'invoice_id' => $invoice->id,
                'customer_id' => $invoice->customer_id,
            ]);
        }

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
