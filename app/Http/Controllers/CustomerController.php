<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\InternetPackage;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index()
    {
        $customers = Customer::with(['package', 'parent'])
            ->withCount('children')
            ->paginate(10);

        return inertia('Customers/Index', [
            'customers' => $customers
        ]);
    }

    public function create()
    {
        return inertia('Customers/Create', [
            'packages' => InternetPackage::all(),
            'customers' => Customer::select('id', 'name')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'status' => 'required|in:active,inactive,paused',
            'address' => 'required|string',
            'phone' => 'required|string|max:255',
            'tax_invoice_number' => 'nullable|string|max:255',
            'customer_id' => 'nullable|exists:customers,id',
            'package_id' => 'required|exists:internet_packages,id',
            'email' => 'required|email|unique:customers,email',
            'coordinate' => 'nullable|string|max:255',
            'join_date' => 'required|date',
            'inactive_at' => 'nullable|date',
        ]);

        Customer::create($validated);

        return redirect()->route('customers.index')
            ->with('message', 'Customer created successfully.');
    }

    public function edit(Customer $customer)
    {
        return inertia('Customers/Edit', [
            'customer' => $customer->load('package', 'parent'),
            'packages' => InternetPackage::all(),
            'customers' => Customer::where('id', '!=', $customer->id)
                ->select('id', 'name')
                ->get()
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
            'customer_id' => 'nullable|exists:customers,id',
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
