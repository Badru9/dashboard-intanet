<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\CustomersOffline;
use App\Models\InternetPackage;
use App\Models\Invoice;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Database\QueryException;
use Illuminate\Validation\ValidationException;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Customer::query();

            // Log untuk melihat request yang masuk
            Log::info('Request Data:', [
                'search' => $request->search,
                'status' => $request->status
            ]);

            if ($request->filled('search')) {
                $search = $request->input('search');
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            }

            // Filter berdasarkan status
            if ($request->filled('status') && $request->status !== 'all') {
                $query->where('status', $request->input('status'));
            }

            // Debug query yang dihasilkan
            Log::info('Query Debug:', [
                'sql' => $query->toSql(),
                'bindings' => $query->getBindings(),
                'count' => $query->count() // Cek jumlah data sebelum paginasi
            ]);

            $customers = $query->with('package')
                ->orderBy('join_date', 'desc')
                ->paginate(10)
                ->withQueryString();

            $packages = InternetPackage::select('id', 'name', 'price')->get();

            // Debug hasil akhir
            Log::info('Final Result:', [
                'total_data' => $customers->total(),
                'current_page' => $customers->currentPage(),
                'per_page' => $customers->perPage()
            ]);

            return inertia('Customers/Index', [
                'customers' => $customers,
                'packages' => $packages,
                'filters' => $request->only(['search', 'status']),
            ]);
        } catch (\Exception $e) {
            Log::error('Error in Customer Index:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->with('error', 'Terjadi kesalahan saat memuat data.');
        }
    }

    public function store(Request $request)
    {
        Log::info('Request data:', $request->all());

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'customer_id' => 'nullable|string|max:255',
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
                'customer_id' => $validated['customer_id'],
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

    // public function import(Request $request)
    // {
    //     Log::info('Request data:', $request->all());

    //     $validated = $request->validate([
    //         'file' => 'required|file|mimes:csv,xlsx,xls',
    //     ]);

    //     $file = $validated['file'];
    //     $extension = $file->getClientOriginalExtension();

    //     try {
    //         if ($extension === 'csv') {
    //             $data = array_map('str_getcsv', file($file->getPathname()));
    //             $headers = array_shift($data);

    //             Log::info('CSV Headers:', $headers);
    //             Log::info('CSV Data:', $data);
    //         } else {
    //             // Untuk file Excel (.xlsx, .xls)
    //             $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($file->getPathname());
    //             $worksheet = $spreadsheet->getActiveSheet();
    //             $data = $worksheet->toArray();
    //             $headers = array_shift($data);

    //             // Membersihkan headers dari nilai null
    //             $headers = array_filter($headers, function ($value) {
    //                 return $value !== null;
    //             });

    //             // Membersihkan data dari kolom kosong
    //             $data = array_map(function ($row) use ($headers) {
    //                 return array_slice($row, 0, count($headers));
    //             }, $data);

    //             Log::info('Excel Headers:', $headers);
    //             Log::info('Excel Data:', $data);

    //             // Proses penyimpanan data
    //             $successCount = 0;
    //             $errorCount = 0;
    //             $errors = [];
    //             $validatedData = [];

    //             // Validasi semua data terlebih dahulu
    //             foreach ($data as $index => $row) {
    //                 try {
    //                     // Konversi data sesuai format yang dibutuhkan
    //                     $customerData = [
    //                         'name' => $row[0] ?? null,
    //                         'customer_id' => $row[1] ?? null,
    //                         'address' => $row[2] ?? null,
    //                         'npwp' => $row[3] ?? null,
    //                         'tax_invoice_number' => $row[4] ?? null,
    //                         'phone' => $row[5] ?? null,
    //                         'email' => $row[6] ?? null,
    //                         'coordinate' => $row[7] ?? null,
    //                         'package_id' => $row[8] ?? null,
    //                         'status' => $row[9] ?? 'online',
    //                         'join_date' => $row[10] ? Carbon::parse($row[10])->format('Y-m-d') : null,
    //                         'bill_date' => $row[11] ? (int)$row[11] : null,
    //                     ];

    //                     // Validasi data wajib
    //                     if (empty($customerData['name']) || empty($customerData['address']) || empty($customerData['package_id'])) {
    //                         throw new \Exception('Data tidak lengkap (nama, alamat, atau paket)');
    //                     }

    //                     // Validasi bill_date
    //                     if (empty($customerData['bill_date'])) {
    //                         throw new \Exception('Tanggal tagihan (bill_date) harus diisi');
    //                     }

    //                     // Validasi range bill_date (1-28)
    //                     if ($customerData['bill_date'] < 1 || $customerData['bill_date'] > 28) {
    //                         throw new \Exception('Tanggal tagihan (bill_date) harus antara 1-28');
    //                     }

    //                     // Cek apakah email sudah ada
    //                     if (!empty($customerData['email'])) {
    //                         $existingCustomer = Customer::where('email', $customerData['email'])->first();
    //                         if ($existingCustomer) {
    //                             throw new \Exception('Email sudah terdaftar');
    //                         }
    //                     }

    //                     $validatedData[] = $customerData;
    //                 } catch (\Exception $e) {
    //                     $errorCount++;
    //                     $errors[] = "Baris " . ($index + 2) . ": " . $e->getMessage();
    //                 }
    //             }

    //             // Jika ada error, hentikan proses import
    //             if ($errorCount > 0) {
    //                 $message = "Import dibatalkan. Terdapat {$errorCount} error:";
    //                 Log::error('Import errors:', $errors);
    //                 throw ValidationException::withMessages([
    //                     'import_errors' => $errors,
    //                     'message' => $message,
    //                 ]);
    //             }

    //             // Jika semua data valid, lakukan import
    //             foreach ($validatedData as $customerData) {
    //                 try {
    //                     // Buat customer baru
    //                     $customer = Customer::create($customerData);

    //                     // Buat invoice jika status active
    //                     if ($customerData['status'] === 'online' && $customerData['bill_date']) {
    //                         $package = InternetPackage::find($customerData['package_id']);
    //                         if ($package) {
    //                             $billDay = (int) $customerData['bill_date'];
    //                             $joinDate = Carbon::parse($customerData['join_date']);

    //                             // Selalu gunakan bulan berikutnya setelah join_date
    //                             $billDate = Carbon::create(
    //                                 $joinDate->year,
    //                                 $joinDate->month,
    //                                 $billDay,
    //                                 0,
    //                                 0,
    //                                 0
    //                             )->addMonth();

    //                             // Cek apakah invoice untuk periode ini sudah ada
    //                             $existingInvoice = Invoice::where('customer_id', $customer->id)
    //                                 ->whereYear('period', $billDate->year)
    //                                 ->whereMonth('period', $billDate->month)
    //                                 ->first();

    //                             if (!$existingInvoice) {
    //                                 Invoice::create([
    //                                     'customer_id' => $customer->id,
    //                                     'package_id' => $package->id,
    //                                     'amount' => $package->price,
    //                                     'status' => 'unpaid',
    //                                     'due_date' => $billDate,
    //                                     'period' => $billDate,
    //                                     'created_by' => Auth::id(),
    //                                 ]);
    //                             }
    //                         }
    //                     }

    //                     $successCount++;
    //                 } catch (\Exception $e) {
    //                     $errorCount++;
    //                     $errors[] = "Gagal menyimpan data: " . $e->getMessage();
    //                 }
    //             }

    //             $message = "Import selesai. Berhasil: {$successCount}, Gagal: {$errorCount}";
    //             if ($errorCount > 0) {
    //                 $message .= ". Silakan cek log untuk detail error.";
    //                 Log::error('Import errors:', $errors);
    //             }

    //             return redirect()->route('customers.index')
    //                 ->with('message', $message);
    //         }

    //         return response()->json([
    //             'message' => 'Format file tidak didukung',
    //         ], 422);
    //     } catch (\Exception $e) {
    //         Log::error('Error reading file:', ['error' => $e->getMessage()]);
    //         throw ValidationException::withMessages([
    //             'import_errors' => ['Gagal membaca file: ' . $e->getMessage()],
    //         ]);
    //     }
    // }

    public function import(Request $request)
    {
        Log::info('Request data:', $request->all());

        // Validasi file yang diunggah
        $validated = $request->validate([
            'file' => 'required|file|mimes:csv,xlsx,xls',
        ]);

        $file = $validated['file'];
        $extension = $file->getClientOriginalExtension();

        try {
            $data = [];
            $headers = [];

            // Membaca data dari file berdasarkan ekstensi
            if ($extension === 'csv') {
                $data = array_map('str_getcsv', file($file->getPathname()));
                $headers = array_shift($data);

                Log::info('CSV Headers:', $headers);
                Log::info('CSV Data:', $data);
            } elseif (in_array($extension, ['xlsx', 'xls'])) {
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
                    // Hanya ambil data sepanjang jumlah header yang valid
                    return array_slice($row, 0, count($headers));
                }, $data);

                Log::info('Excel Headers:', $headers);
                Log::info('Excel Data:', $data);
            } else {
                // Jika format file tidak didukung, lempar exception
                throw ValidationException::withMessages([
                    'file' => ['Format file tidak didukung.'],
                ]);
            }

            // Ambil nilai PPN dari tabel settings
            $ppnSetting = Setting::where('key', 'ppn')->first();
            if (!$ppnSetting) {
                // Jika setting PPN tidak ditemukan, lempar exception
                throw ValidationException::withMessages([
                    'import_errors' => ['Setting PPN (key: "ppn") tidak ditemukan di database. Harap konfigurasikan terlebih dahulu.'],
                ]);
            }
            $ppnPercentage = (float) $ppnSetting->value; // Mengambil nilai PPN sebagai float

            $successCount = 0; // Menghitung data yang berhasil diimpor
            $generalErrors = []; // Array untuk menyimpan error validasi baris yang bersifat fatal (misal: data tidak lengkap)
            $duplicateCustomers = []; // Array untuk menyimpan detail data pelanggan yang duplikat

            // Iterasi setiap baris data untuk diimpor
            foreach ($data as $index => $row) {
                // Nomor baris di file Excel/CSV (dimulai dari 1 + 1 untuk header)
                $rowNumber = $index + 2;

                // Lewati baris yang kosong sepenuhnya
                if (empty(array_filter($row))) {
                    continue;
                }

                $customerData = []; // Deklarasikan di luar try untuk akses di catch
                try {
                    // Mapping data baris ke format yang dibutuhkan model Customer
                    $customerData = [
                        'name' => $row[0] ?? null,
                        'customer_id' => $row[1] ?? null,
                        'address' => $row[2] ?? null,
                        'npwp' => $row[3] ?? null,
                        'tax_invoice_number' => $row[4] ?? null,
                        'phone' => $row[5] ?? null,
                        'email' => $row[6] ?? null,
                        'coordinate' => $row[7] ?? null,
                        'package_id' => $row[8] ?? null,
                        'status' => $row[9] ?? 'online',
                        'join_date' => $row[10] ? Carbon::parse($row[10])->format('Y-m-d') : null,
                        'bill_date' => $row[11] ? (int)$row[11] : null,
                    ];

                    // Validasi data wajib (nama, alamat, package_id)
                    if (empty($customerData['name'])) {
                        throw new \Exception('Nama tidak boleh kosong.');
                    }
                    if (empty($customerData['address'])) {
                        throw new \Exception('Alamat tidak boleh kosong.');
                    }
                    if (empty($customerData['package_id'])) {
                        throw new \Exception('ID Paket tidak boleh kosong.');
                    }

                    // Validasi keberadaan package_id di database
                    if ($customerData['package_id'] && !InternetPackage::find($customerData['package_id'])) {
                        throw new \Exception("ID Paket '{$customerData['package_id']}' tidak ditemukan.");
                    }

                    // Validasi bill_date
                    if (empty($customerData['bill_date'])) {
                        throw new \Exception('Tanggal tagihan (bill_date) harus diisi.');
                    }
                    // Validasi range bill_date (1-28)
                    if ($customerData['bill_date'] < 1 || $customerData['bill_date'] > 28) {
                        throw new \Exception('Tanggal tagihan (bill_date) harus antara 1-28.');
                    }

                    // Cek apakah email sudah ada (duplikasi) menggunakan pre-check
                    if (!empty($customerData['email'])) {
                        $existingCustomer = Customer::where('email', $customerData['email'])->first();
                        if ($existingCustomer) {
                            // Ini adalah duplikasi yang tertangkap oleh pre-check
                            $duplicateCustomers[] = [
                                'row' => $rowNumber,
                                'email' => $customerData['email'],
                                'name' => $customerData['name'],
                                'message' => "Email '" . $customerData['email'] . "' sudah terdaftar.",
                            ];
                            continue; // Lanjutkan ke baris berikutnya tanpa menyimpan data ini
                        }
                    }

                    // Jika semua validasi dilewati dan bukan duplikat, simpan data pelanggan
                    $customer = Customer::create([
                        'name' => $customerData['name'],
                        'customer_id' => $customerData['customer_id'],
                        'status' => $customerData['status'],
                        'address' => $customerData['address'],
                        'phone' => $customerData['phone'],
                        'npwp' => $customerData['npwp'],
                        'package_id' => $customerData['package_id'],
                        'email' => $customerData['email'] ?: null, // Simpan null jika email kosong
                        'coordinate' => isset($customerData['coordinate']) ? $customerData['coordinate'] : null,
                        'join_date' => $customerData['join_date'],
                        'bill_date' => $customerData['bill_date'],
                    ]);

                    // Buat invoice jika status pelanggan 'online' dan bill_date ada
                    if ($customerData['status'] === 'online' && $customerData['bill_date']) {
                        $package = InternetPackage::find($customerData['package_id']);
                        if ($package) { // Pastikan $package ditemukan
                            $billDay = (int) $customerData['bill_date'];
                            $joinDate = Carbon::parse($customerData['join_date']);

                            // Selalu gunakan bulan berikutnya setelah join_date untuk tanggal tagihan
                            $billDate = Carbon::create(
                                $joinDate->year,
                                $joinDate->month,
                                $billDay,
                                0,
                                0,
                                0
                            )->addMonth();

                            // Cek apakah invoice untuk periode ini sudah ada agar tidak duplikat
                            $existingInvoice = Invoice::where('customer_id', $customer->id)
                                ->whereYear('due_date', $billDate->year)
                                ->whereMonth('due_date', $billDate->month)
                                ->first();

                            if (!$existingInvoice) {
                                // Hitung PPN dari harga paket
                                $ppnAmount = $package->price * ($ppnPercentage / 100);

                                Invoice::create([
                                    'customer_id' => $customer->id,
                                    'package_id' => $package->id,
                                    'amount' => $package->price,
                                    'ppn' => $ppnAmount, // Sertakan nilai PPN yang dihitung
                                    'status' => 'unpaid',
                                    'due_date' => $billDate,
                                    'created_by' => Auth::id(),
                                ]);
                            }
                        }
                    }
                    $successCount++;
                } catch (QueryException $e) {
                    // --- PERBAIKAN: Tangani QueryException secara spesifik untuk duplikasi ---
                    // Cek jika error adalah "Duplicate entry" (kode SQLSTATE 23000)
                    if ($e->getCode() === '23000' && str_contains($e->getMessage(), 'Duplicate entry')) {
                        // Pastikan ada email di customerData, jika tidak, log pesan umum
                        $duplicateEmail = $customerData['email'] ?? 'Tidak Diketahui';
                        $duplicateCustomers[] = [
                            'row' => $rowNumber,
                            'email' => $duplicateEmail,
                            'name' => $customerData['name'] ?? 'Tidak Diketahui',
                            'message' => "Email '" . $duplicateEmail . "' sudah terdaftar (dari batasan UNIQUE database).",
                        ];
                        Log::warning('Database duplicate entry for row ' . $rowNumber . ':', ['message' => $e->getMessage(), 'data' => $customerData]);
                    } else {
                        // Error QueryException lainnya (misalnya foreign key constraint)
                        $generalErrors[] = "Baris " . $rowNumber . ": " . $e->getMessage();
                        Log::error('Import Query error for row ' . $rowNumber . ':', ['message' => $e->getMessage(), 'data' => $customerData]);
                    }
                    // --- AKHIR PERBAIKAN ---
                } catch (\Exception $e) {
                    // Menangkap dan menyimpan error umum lainnya untuk baris saat ini (sebagai string)
                    $generalErrors[] = "Baris " . $rowNumber . ": " . $e->getMessage();
                    Log::error('Import general error for row ' . $rowNumber . ':', ['message' => $e->getMessage(), 'data' => $customerData]);
                }
            }

            // Jika ada error validasi umum yang terjadi (bukan duplikat), lempar ValidationException
            if (!empty($generalErrors)) {
                // Ini akan mengirim array string, sesuai format yang diharapkan oleh ValidationException
                throw ValidationException::withMessages([
                    'import_errors' => $generalErrors,
                ]);
            }

            // // Jika tidak ada error validasi umum, persiapkan pesan sukses dan data duplikat
            // $message = "Import selesai. Berhasil: {$successCount} data.";

            // if (!empty($duplicateCustomers)) {
            //     // Jika ada data duplikat, render halaman DuplicateDataInfo dan kirimkan data tersebut
            //     // serta pesan sukses impor untuk total data yang berhasil.
            //     return Inertia::render('Customers/Import', [
            //         'duplicateCustomers' => $duplicateCustomers,
            //         'importSuccessMessage' => "Import selesai. Berhasil: {$successCount} data.",
            //     ]);
            // } else {
            //     // Jika tidak ada error fatal dan tidak ada duplikat, redirect dengan pesan sukses
            //     $message = "Import selesai. Berhasil: {$successCount} data.";
            //     return redirect()->route('customers.index')->with('success', $message);
            // }

            $message = "Import selesai. Berhasil: {$successCount} data.";
            $flashData = ['success' => $message];

            if (!empty($duplicateCustomers)) {
                $flashData['duplicate_customers_info'] = $duplicateCustomers;
            }

            return redirect()->route('customers.index')->with($flashData);
        } catch (ValidationException $e) {
            // Re-throw ValidationException agar ditangani oleh handler exception Laravel
            throw $e;
        } catch (\Exception $e) {
            // Menangkap error yang terjadi di luar loop (misalnya, masalah membaca file)
            Log::error('Error reading file or general import error:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            throw ValidationException::withMessages([
                'file' => ['Gagal memproses file: ' . $e->getMessage()], // Kaitkan error umum dengan field 'file'
            ]);
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
            'customer_id' => 'required|string|max:255',
            'status' => 'required|string|in:online,inactive,offline',
            'address' => 'required|string',
            'email' => 'nullable|email|unique:customers,email,' . $customer->id,
            'npwp' => 'nullable|string|max:255',
            'package_id' => 'required|exists:internet_packages,id',
            'phone' => 'required|string|max:255',
            'coordinates' => 'nullable|array',
            'coordinates.latitude' => 'nullable|string',
            'coordinates.longitude' => 'nullable|string',
            'join_date' => 'required|date',
            'bill_date' => 'required|integer|min:1|max:28',
        ]);

        Log::info('Validated update data:', $validated);

        $customer->update([
            'name' => $validated['name'],
            'customer_id' => $validated['customer_id'],
            'status' => $validated['status'],
            'address' => $validated['address'],
            'email' => $validated['email'] ?: null,
            'npwp' => $validated['npwp'],
            'package_id' => $validated['package_id'],
            'phone' => $validated['phone'],
            'coordinate' => isset($validated['coordinates']) ?
                $validated['coordinates']['latitude'] . ',' . $validated['coordinates']['longitude'] : null,
            'join_date' => $validated['join_date'],
            'bill_date' => $validated['bill_date'],
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

                $existing = CustomersOffline::where('customer_id', $customer->id)
                    ->whereNull('to')
                    ->first();

                if (!$existing) {
                    CustomersOffline::create([
                        'customer_id' => $customer->id,
                        'from' => now(),
                    ]);
                }
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
