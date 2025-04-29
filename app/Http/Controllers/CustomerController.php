<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\InternetPackage;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Carbon\Carbon;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = Customer::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $customers = $query->with('package')->paginate(10)->withQueryString();

        $packages = InternetPackage::select('id', 'name', 'price')->get();

        return inertia('Customers/Index', [
            'customers' => $customers,
            'packages' => $packages,
            'filters' => $request->only('search'),
        ]);
    }

    public function store(Request $request)
    {
        Log::info('Request data:', $request->all());

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'status' => 'required|in:active,inactive,paused',
            'address' => 'required|string',
            'phone' => 'required|string|max:255',
            'npwp' => 'required|string|max:255',
            'package_id' => 'required|exists:internet_packages,id',
            'coordinates' => 'nullable|array',
            'coordinates.latitude' => 'nullable|string',
            'coordinates.longitude' => 'nullable|string',
            'join_date' => 'required|date',
            'email' => 'nullable|email|unique:customers,email',
            'bill_date' => 'required|date',
        ]);

        Log::info('Validated data:', $validated);

        try {
            $customer = Customer::create([
                'name' => $validated['name'],
                'status' => $validated['status'],
                'address' => $validated['address'],
                'phone' => $validated['phone'],
                'npwp' => $validated['npwp'],
                'package_id' => $validated['package_id'],
                'email' => $validated['email'] ?: null,
                'coordinate' => isset($validated['coordinates']) ?
                    $validated['coordinates']['latitude'] . ',' . $validated['coordinates']['longitude'] : null,
                'join_date' => $validated['join_date'],
                'bill_date' => $validated['bill_date'],
            ]);

            // Membuat invoice otomatis
            $package = InternetPackage::find($validated['package_id']);
            $dueDate = Carbon::parse($validated['bill_date'])->addMonth();

            Invoice::create([
                'customer_id' => $customer->id,
                'package_id' => $validated['package_id'],
                'amount' => $package->price,
                'status' => 'unpaid',
                'due_date' => $dueDate,
                'period' => Carbon::parse($validated['bill_date']),
                'created_by' => Auth::id(),
            ]);

            Log::info('Customer created successfully', ['customer' => $customer]);

            return redirect()->route('customers.index')
                ->with('message', 'Customer berhasil ditambahkan.');
        } catch (\Exception $e) {
            Log::error('Failed to create customer', ['error' => $e->getMessage()]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal menambahkan customer. Silakan coba lagi.');
        }
    }

    public function edit(Customer $customer)
    {
        return Inertia::render('Customers/Edit', [
            'customer' => $customer->load('package'),
            'packages' => InternetPackage::all(),
        ]);
    }

    public function update(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'status' => 'required|string|in:active,inactive,paused',
            'address' => 'required|string',
            'email' => 'nullable|email|unique:customers,email,' . $customer->id,
            'npwp' => 'nullable|string|max:255',
            'package_id' => 'required|exists:internet_packages,id',
            'phone' => 'required|string|max:255',
            'coordinates' => 'nullable|array',
            'coordinates.latitude' => 'nullable|string',
            'coordinates.longitude' => 'nullable|string',
            'join_date' => 'required|date',
        ]);

        $customer->update([
            'name' => $validated['name'],
            'status' => $validated['status'],
            'address' => $validated['address'],
            'email' => $validated['email'] ?: null,
            'npwp' => $validated['npwp'],
            'package_id' => $validated['package_id'],
            'phone' => $validated['phone'],
            'coordinate' => isset($validated['coordinates']) ?
                $validated['coordinates']['latitude'] . ',' . $validated['coordinates']['longitude'] : null,
            'join_date' => $validated['join_date'],
        ]);

        return redirect()->route('customers.index')
            ->with('success', 'Customer berhasil diperbarui');
    }

    public function destroy(Customer $customer)
    {
        $customer->delete();

        return redirect()->route('customers.index')
            ->with('message', 'Customer deleted successfully.');
    }

    public function updateStatus(Customer $customer, Request $request)
    {
        $validated = $request->validate([
            'status' => 'required|in:active,inactive,paused',
            'bill_date' => 'required_if:status,active|date',
        ]);

        try {
            $customer->update($validated);

            // Jika status berubah menjadi inactive atau paused, nonaktifkan invoice yang belum dibayar
            if (in_array($validated['status'], ['inactive', 'paused'])) {
                Invoice::where('customer_id', $customer->id)
                    ->where('status', 'unpaid')
                    ->update(['status' => 'cancelled']);
            }

            // Jika status berubah menjadi active, buat invoice baru
            if ($validated['status'] === 'active' && isset($validated['bill_date'])) {
                $package = $customer->package;
                $dueDate = Carbon::parse($validated['bill_date'])->addMonth();

                Invoice::create([
                    'customer_id' => $customer->id,
                    'package_id' => $package->id,
                    'amount' => $package->price,
                    'status' => 'unpaid',
                    'due_date' => $dueDate,
                    'period' => Carbon::parse($validated['bill_date']),
                    'created_by' => Auth::id(),
                ]);
            }

            return redirect()->back()->with('success', 'Status customer berhasil diperbarui');
        } catch (\Exception $e) {
            Log::error('Failed to update customer status', [
                'customer_id' => $customer->id,
                'error' => $e->getMessage()
            ]);

            return redirect()->back()->with('error', 'Gagal mengubah status customer');
        }
    }
}
