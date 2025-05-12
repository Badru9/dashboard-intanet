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

        $customers = $query->with('package')
            ->orderBy('join_date', 'desc')
            ->paginate(10)
            ->withQueryString();

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
            'status' => 'required|in:online,inactive,offline',
            'address' => 'required|string',
            'phone' => 'required|string|max:255',
            'npwp' => 'required|string|max:255',
            'package_id' => 'required|exists:internet_packages,id',
            'coordinates' => 'nullable|array',
            'coordinates.latitude' => 'nullable|string',
            'coordinates.longitude' => 'nullable|string',
            'join_date' => 'required|date',
            'email' => 'nullable|email|unique:customers,email',
            'bill_date' => 'required|integer|min:1|max:28',
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
            $billDay = (int) $validated['bill_date'];
            $joinDate = Carbon::parse($validated['join_date']);

            // Gunakan bulan dan tahun dari join_date, tapi tanggal dari bill_date
            $billDate = Carbon::create(
                $joinDate->year,
                $joinDate->month,
                $billDay,
                0,
                0,
                0
            )->addMonth(); // Selalu buat invoice untuk bulan berikutnya

            // $dueDate = $billDate->copy()->addMonth();

            Invoice::create([
                'customer_id' => $customer->id,
                'package_id' => $validated['package_id'],
                'amount' => $package->price,
                'status' => 'unpaid',
                'due_date' => $billDate,
                'period' => $billDate,
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

    public function import(Request $request)
    {
        Log::info('Request data:', $request->all());

        $validated = $request->validate([
            'file' => 'required|file|mimes:csv,xlsx,xls',
        ]);

        $file = $validated['file'];
        $extension = $file->getClientOriginalExtension();

        try {
            if ($extension === 'csv') {
                $data = array_map('str_getcsv', file($file->getPathname()));
                $headers = array_shift($data);

                Log::info('CSV Headers:', $headers);
                Log::info('CSV Data:', $data);
            } else {
                // Untuk file Excel (.xlsx, .xls)
                $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($file->getPathname());
                $worksheet = $spreadsheet->getActiveSheet();
                $data = $worksheet->toArray();
                $headers = array_shift($data);

                // Membersihkan headers dari nilai null
                $headers = array_filter($headers, function ($value) {
                    return $value !== null;
                });

                // Membersihkan data dari kolom kosong
                $data = array_map(function ($row) use ($headers) {
                    return array_slice($row, 0, count($headers));
                }, $data);

                Log::info('Excel Headers:', $headers);
                Log::info('Excel Data:', $data);

                // Proses penyimpanan data
                $successCount = 0;
                $errorCount = 0;
                $errors = [];

                foreach ($data as $index => $row) {
                    try {
                        // Konversi data sesuai format yang dibutuhkan
                        $customerData = [
                            'name' => $row[0] ?? null,
                            'address' => $row[1] ?? null,
                            'npwp' => $row[2] ?? null,
                            'phone' => $row[4] ?? null,
                            'email' => $row[5] ?? null,
                            'coordinate' => $row[6] ?? null,
                            'package_id' => $row[7] ?? null,
                            'status' => $row[8] ?? 'online',
                            'join_date' => $row[9] ? Carbon::parse($row[9])->format('Y-m-d') : null,
                            'bill_date' => $row[10] ? Carbon::parse($row[10])->day : ($row[9] ? Carbon::parse($row[9])->addMonth()->day : null),
                        ];

                        // Tambahkan logging untuk debugging
                        Log::info('Customer data before validation:', $customerData);

                        // Validasi data
                        if (empty($customerData['name']) || empty($customerData['address']) || empty($customerData['package_id'])) {
                            Log::error('Validation failed:', [
                                'name' => $customerData['name'],
                                'address' => $customerData['address'],
                                'package_id' => $customerData['package_id']
                            ]);
                            throw new \Exception('Data tidak lengkap');
                        }

                        // Cek apakah email sudah ada
                        if (!empty($customerData['email'])) {
                            $existingCustomer = Customer::where('email', $customerData['email'])->first();
                            if ($existingCustomer) {
                                throw new \Exception('Email sudah terdaftar');
                            }
                        }

                        // Buat customer baru
                        $customer = Customer::create($customerData);

                        // Buat invoice jika status active
                        if ($customerData['status'] === 'online' && $customerData['bill_date']) {
                            $package = InternetPackage::find($customerData['package_id']);
                            if ($package) {
                                $billDay = (int) $customerData['bill_date'];
                                $joinDate = Carbon::parse($customerData['join_date']);

                                // Selalu gunakan bulan berikutnya setelah join_date
                                $billDate = Carbon::create(
                                    $joinDate->year,
                                    $joinDate->month,
                                    $billDay,
                                    0,
                                    0,
                                    0
                                )->addMonth();


                                // Cek apakah invoice untuk periode ini sudah ada
                                $existingInvoice = Invoice::where('customer_id', $customer->id)
                                    ->whereYear('period', $billDate->year)
                                    ->whereMonth('period', $billDate->month)
                                    ->first();

                                if (!$existingInvoice) {
                                    Invoice::create([
                                        'customer_id' => $customer->id,
                                        'package_id' => $package->id,
                                        'amount' => $package->price,
                                        'status' => 'unpaid',
                                        'due_date' => $billDate,
                                        'period' => $billDate,
                                        'created_by' => Auth::id(),
                                    ]);
                                }
                            }
                        }

                        $successCount++;
                    } catch (\Exception $e) {
                        $errorCount++;
                        $errors[] = "Baris " . ($index + 2) . ": " . $e->getMessage();
                    }
                }

                $message = "Import selesai. Berhasil: {$successCount}, Gagal: {$errorCount}";
                if ($errorCount > 0) {
                    $message .= ". Silakan cek log untuk detail error.";
                    Log::error('Import errors:', $errors);
                }

                return redirect()->route('customers.index')
                    ->with('success', $message);
            }

            return redirect()->route('customers.index')
                ->with('error', 'Format file tidak didukung');
        } catch (\Exception $e) {
            Log::error('Error reading file:', ['error' => $e->getMessage()]);
            return redirect()->route('customers.index')
                ->with('error', 'Gagal membaca file: ' . $e->getMessage());
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
            'status' => 'required|in:online,inactive,offline',
            'bill_date' => 'required_if:status,online|integer|min:1|max:28',
        ]);

        try {
            $customer->update($validated);

            // Jika status berubah menjadi inactive atau offline, nonaktifkan invoice yang belum dibayar
            if (in_array($validated['status'], ['inactive', 'offline'])) {
                Invoice::where('customer_id', $customer->id)
                    ->where('status', 'unpaid')
                    ->update(['status' => 'cancelled']);
            }

            // Jika status berubah menjadi online, buat invoice baru
            if ($validated['status'] === 'online' && isset($validated['bill_date'])) {
                $package = $customer->package;
                $billDay = (int) $validated['bill_date'];
                $now = now();

                // Buat invoice untuk bulan berikutnya
                $billDate = Carbon::create($now->year, $now->month, $billDay, 0, 0, 0)->addMonth();
                $dueDate = $billDate->copy()->addMonth();

                // Cek apakah invoice untuk periode ini sudah ada
                $existingInvoice = Invoice::where('customer_id', $customer->id)
                    ->whereYear('period', $billDate->year)
                    ->whereMonth('period', $billDate->month)
                    ->first();

                if (!$existingInvoice) {
                    Invoice::create([
                        'customer_id' => $customer->id,
                        'package_id' => $package->id,
                        'amount' => $package->price,
                        'status' => 'unpaid',
                        'due_date' => $dueDate,
                        'period' => $billDate,
                        'created_by' => Auth::id(),
                    ]);
                }
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
