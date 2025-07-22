<?php

namespace App\Http\Controllers;

// PASTIKAN IMPORT INI BENAR: dari App\Http\Requests\AttendanceRequest
use App\Models\Attendance;
use Illuminate\Http\Request; // Diperlukan untuk mengakses request() helper dan parameter Request di index
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log; // Diperlukan untuk logging
use Illuminate\Support\Facades\Storage; // Diperlukan untuk mengelola file
use Inertia\Inertia; // Diperlukan untuk Inertia::render

class AttendanceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            // Mulai dengan query base untuk model Attendance dan eager load relasi 'user'
            $query = Attendance::query()->with(['user']);

            // Log untuk melihat request yang masuk
            Log::info('Attendance Index Request Data:', [
                'search' => $request->search,
                'status' => $request->status, // Pastikan ini ada di log untuk debugging
                'page' => $request->page,
            ]);

            // Filter berdasarkan pencarian (sudah case-insensitive)
            if ($request->filled('search')) {
                $search = $request->search;
                $lowerSearch = strtolower($search);

                $query->where(function ($q) use ($lowerSearch) {
                    $q->where(DB::raw('lower(date)'), 'like', '%' . $lowerSearch . '%')
                        ->orWhere(DB::raw('lower(status)'), 'like', '%' . $lowerSearch . '%')
                        ->orWhere(DB::raw('lower(notes)'), 'like', '%' . $lowerSearch . '%')
                        ->orWhereHas('user', function ($qUser) use ($lowerSearch) {
                            $qUser->where(DB::raw('lower(name)'), 'like', '%' . $lowerSearch . '%')->orWhere(DB::raw('lower(email)'), 'like', '%' . $lowerSearch . '%');
                        });
                });
            }

            // FILTER BERDASARKAN STATUS PRESENSI
            // Pastikan ini adalah 'status' yang benar dari request
            if ($request->filled('status') && $request->status !== 'all') {
                $query->where('status', $request->input('status'));
            }

            // Pastikan hanya data yang belum dihapus (soft deletes)
            $query->whereNull('deleted_at');

            // Debug query yang dihasilkan
            // Ini sangat penting untuk melihat SQL yang dieksekusi
            Log::info('Attendance Query Debug:', [
                'sql' => $query->toSql(),
                'bindings' => $query->getBindings(),
                'count' => $query->count() // Cek jumlah data sebelum paginasi
            ]);

            // Eksekusi query dengan paginasi, urutkan berdasarkan tanggal terbaru
            $attendances = $query->orderBy('date', 'desc')
                ->paginate(10)
                ->withQueryString(); // Penting: Pastikan query string tetap ada untuk paginasi

            // Debug hasil akhir
            Log::info('Attendance Final Result:', [
                'total_data' => $attendances->total(),
                'current_page' => $attendances->currentPage(),
                'per_page' => $attendances->perPage()
            ]);

            return Inertia::render('Attendance/Index', [
                'attendances' => $attendances,
                'filters' => $request->only(['search', 'status']), // Pastikan 'status' juga dikirim ke frontend
            ]);
        } catch (\Exception $e) {
            Log::error('Error in Attendance Index:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->with('error', 'Terjadi kesalahan saat memuat data presensi.');
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Untuk halaman 'create', biasanya tidak perlu mengirim semua data attendance.
        // Cukup data yang dibutuhkan untuk form, misalnya daftar user jika attendance terkait user.
        return Inertia::render('Attendance/Create', [
            // Jika Anda perlu data user untuk dropdown di form Create, tambahkan di sini:
            // 'users' => \App\Models\User::select('id', 'name')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Data sudah divalidasi oleh AttendanceRequest
        $validatedData = $request->validated();

        // Handle upload foto check_in jika ada
        if ($request->hasFile('photo_check_in')) {
            $validatedData['photo_check_in'] = $request->file('photo_check_in')->store('photos/check_in', 'public');
        }

        // Handle upload foto check_out jika ada
        if ($request->hasFile('photo_check_out')) {
            $validatedData['photo_check_out'] = $request->file('photo_check_out')->store('photos/check_out', 'public');
        }

        // Buat record Attendance baru
        Attendance::create($validatedData);

        return redirect()->route('attendances.index')
            ->with('success', 'Data presensi berhasil ditambahkan.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Attendance $attendance)
    {
        // Menggunakan Route Model Binding untuk mendapatkan instance Attendance
        // Anda bisa eager load relasi jika diperlukan di form edit
        return Inertia::render('Attendance/Edit', [
            'attendance' => $attendance->load('user'), // Contoh eager load relasi user
            // Jika Anda perlu data user untuk dropdown di form Edit, tambahkan di sini:
            // 'users' => \App\Models\User::select('id', 'name')->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Attendance $attendance)
    {
        // Data sudah divalidasi oleh AttendanceRequest
        $validatedData = $request->validated();

        // Handle photo_check_in update
        if ($request->hasFile('photo_check_in')) {
            // Hapus foto lama jika ada
            if ($attendance->photo_check_in) {
                Storage::disk('public')->delete($attendance->photo_check_in);
            }
            $validatedData['photo_check_in'] = $request->file('photo_check_in')->store('photos/check_in', 'public');
        } elseif (array_key_exists('photo_check_in', $request->all()) && is_null($request->input('photo_check_in'))) {
            // Jika input dikirim null, berarti ingin menghapus foto
            if ($attendance->photo_check_in) {
                Storage::disk('public')->delete($attendance->photo_check_in);
            }
            $validatedData['photo_check_in'] = null;
        }

        // Handle photo_check_out update
        if ($request->hasFile('photo_check_out')) {
            // Hapus foto lama jika ada
            if ($attendance->photo_check_out) {
                Storage::disk('public')->delete($attendance->photo_check_out);
            }
            $validatedData['photo_check_out'] = $request->file('photo_check_out')->store('photos/check_out', 'public');
        } elseif (array_key_exists('photo_check_out', $request->all()) && is_null($request->input('photo_check_out'))) {
            // Jika input dikirim null, berarti ingin menghapus foto
            if ($attendance->photo_check_out) {
                Storage::disk('public')->delete($attendance->photo_check_out);
            }
            $validatedData['photo_check_out'] = null;
        }

        // Perbarui record Attendance
        $attendance->update($validatedData);

        return redirect()->route('attendances.index')
            ->with('success', 'Data presensi berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Attendance $attendance)
    {
        try {
            // Sebelum menghapus record, hapus juga file fotonya jika ada
            if ($attendance->photo_check_in) {
                Storage::disk('public')->delete($attendance->photo_check_in);
            }
            if ($attendance->photo_check_out) {
                Storage::disk('public')->delete($attendance->photo_check_out);
            }

            $attendance->delete();

            return redirect()->route('attendances.index')
                ->with('success', 'Data presensi berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error('Error deleting Attendance:', [
                'attendance_id' => $attendance->id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->with('error', 'Terjadi kesalahan saat menghapus data presensi.');
        }
    }
}
