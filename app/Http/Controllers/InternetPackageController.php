<?php

namespace App\Http\Controllers;

use App\Models\InternetPackage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InternetPackageController extends Controller
{
    public function index()
    {
        $packages = DB::table('internet_packages')->get();
        return inertia('InternetPackages/Index', [
            'packages' => $packages
        ]);
    }

    public function create()
    {
        return inertia('InternetPackages/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'speed' => 'required|string|max:255',
        ]);

        InternetPackage::create($validated);

        return redirect()->route('internet-packages.index')
            ->with('message', 'Package created successfully.');
    }

    public function edit(InternetPackage $package)
    {
        return inertia('InternetPackages/Edit', [
            'package' => $package
        ]);
    }

    public function update(Request $request, InternetPackage $package)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'speed' => 'required|string|max:255',
        ]);

        $package->update($validated);

        return redirect()->route('internet-packages.index')
            ->with('message', 'Package updated successfully.');
    }

    public function destroy(InternetPackage $package)
    {
        $package->delete();

        return redirect()->route('internet-packages.index')
            ->with('message', 'Package deleted successfully.');
    }

    public function getPackages()
    {
        $packages = InternetPackage::select('id', 'name', 'price')->get();
        return response()->json($packages);
    }
}
