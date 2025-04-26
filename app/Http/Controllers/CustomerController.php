<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\InternetPackage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index()
    {
        $customers = Customer::with(['package'])
            ->paginate(10);

        $packages = InternetPackage::select('id', 'name', 'price')->get();

        return inertia('Customers/Index', [
            'customers' => $customers,
            'packages' => $packages
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'status' => 'required|in:active,inactive,paused',
            'address' => 'required|string',
            'phone' => 'required|string|max:255',
            'tax_invoice' => 'nullable|string|max:255',
            'package_id' => 'required|exists:internet_packages,id',
            'coordinate' => 'required|array',
            'coordinate.latitude' => 'required|string',
            'coordinate.longitude' => 'required|string',
            'join_date' => 'required|date',
        ]);

        $customer = Customer::create([
            'name' => $validated['name'],
            'status' => $validated['status'],
            'address' => $validated['address'],
            'phone' => $validated['phone'],
            'tax_number' => $validated['tax_number'],
            'package_id' => $validated['package_id'],
            'coordinate' => json_encode($validated['coordinate']),
            'join_date' => $validated['join_date'],
        ]);

        return redirect()->route('customers.index')
            ->with('message', 'Customer created successfully.');
    }

    public function edit(Customer $customer)
    {
        return inertia('Customers/Edit', [
            'customer' => $customer->load('package'),
            'packages' => InternetPackage::all()
        ]);
    }

    public function update(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'status' => 'required|in:active,inactive,paused',
            'address' => 'required|string',
            'phone' => 'required|string|max:255',
            'tax_invoice_number' => 'nullable|string|max:255',
            'package_id' => 'required|exists:internet_packages,id',
            'email' => 'required|email|unique:customers,email,' . $customer->id,
            'coordinate' => 'nullable|string|max:255',
            'join_date' => 'required|date',
            'inactive_at' => 'nullable|date',
        ]);

        $customer->update($validated);

        return redirect()->route('customers.index')
            ->with('message', 'Customer updated successfully.');
    }

    public function destroy(Customer $customer)
    {
        $customer->delete();

        return redirect()->route('customers.index')
            ->with('message', 'Customer deleted successfully.');
    }
}
