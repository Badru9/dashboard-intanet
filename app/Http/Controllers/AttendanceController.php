<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // <--- Import Auth Facade
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Carbon\Carbon; // <--- Import Carbon untuk penanganan tanggal/waktu
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AttendanceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = Attendance::query()->with(['user']);

            Log::info('Attendance Index Request Data:', [
                'search' => $request->search,
                'status' => $request->status,
                'page' => $request->page,
            ]);

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

            if ($request->filled('status') && $request->status !== 'all') {
                $query->where('status', $request->input('status'));
            }

            $query->whereNull('deleted_at');

            Log::info('Attendance Query Debug:', [
                'sql' => $query->toSql(),
                'bindings' => $query->getBindings(),
                'count' => $query->count()
            ]);

            $attendances = $query->orderBy('date', 'desc')
                ->paginate(10)
                ->withQueryString();

            Log::info('Attendance Final Result:', [
                'total_data' => $attendances->total(),
                'current_page' => $attendances->currentPage(),
                'per_page' => $attendances->perPage()
            ]);

            $users = User::select('id', 'name')->get();
            $currentUser = Auth::user();
            $attendanceToday = null;

            if ($currentUser) {
                $attendanceToday = Attendance::where('user_id', $currentUser->id)
                    ->whereDate('date', Carbon::today())
                    ->first();

                if ($attendanceToday) {
                    $currentUserAttendanceStatus['has_checked_in_today'] = true;
                    $currentUserAttendanceStatus['attendance_id'] = $attendanceToday->id;
                    if ($attendanceToday->check_out_time) {
                        $currentUserAttendanceStatus['has_checked_out_today'] = true;
                    }
                }
            }

            return Inertia::render('Attendance/Index', [
                'attendances' => $attendances,
                'filters' => $request->only(['search', 'status']),
                'users' => $users,
                'currentUserAttendanceStatus' => [
                    'has_checked_in_today' => (bool)$attendanceToday,
                    'has_checked_out_today' => (bool)($attendanceToday && $attendanceToday->check_out_time),
                    'attendance_id' => $attendanceToday ? $attendanceToday->id : null,
                ],
                // Anda juga mungkin ingin mengirim status check-in/out user yang sedang login
                // 'current_user_attendance_status' => $this->getCurrentUserAttendanceStatus(),
            ]);
        } catch (\Exception $e) {
            Log::error('Error in Attendance Index:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()->with('error', 'Terjadi kesalahan saat memuat data presensi.');
        }
    }

    // Metode create() tidak lagi diperlukan karena modal CreateAttendance dibuka dari Index
    // dan data users sudah dikirim melalui index().
    // public function create()
    // {
    //     return Inertia::render('Attendance/Create', [
    //         'users' => User::select('id', 'name')->get(),
    //     ]);
    // }

    /**
     * Store a newly created resource in storage (for Admin manual entry).
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'date' => ['required', 'date_format:Y-m-d'],
            'check_in_time' => ['required', 'date_format:Y-m-d H:i:s'],
            'check_out_time' => ['nullable', 'date_format:Y-m-d H:i:s', 'after:check_in_time'],
            'break_start_time' => ['nullable', 'date_format:Y-m-d H:i:s', 'after:check_in_time'],
            'break_end_time' => ['nullable', 'date_format:Y-m-d H:i:s', 'after:break_start_time'],
            'status' => ['required', Rule::in(['PRESENT', 'ABSENT', 'LEAVE', 'SICK', 'HALF_DAY', 'LATE'])],
            'notes' => ['nullable', 'string', 'max:500'],
            'location_check_in' => ['nullable', 'string', 'max:255'],
            'location_check_out' => ['nullable', 'string', 'max:255'],
            'photo_check_in' => ['nullable', 'image', 'max:2048'],
            'photo_check_out' => ['nullable', 'image', 'max:2048'],
        ]);

        if ($request->hasFile('photo_check_in')) {
            $validatedData['photo_check_in'] = $request->file('photo_check_in')->store('photos/check_in', 'public');
        }

        if ($request->hasFile('photo_check_out')) {
            $validatedData['photo_check_out'] = $request->file('photo_check_out')->store('photos/check_out', 'public');
        }

        Attendance::create($validatedData);

        return redirect()->route('attendances.index')
            ->with('success', 'Data presensi berhasil ditambahkan (Admin).');
    }

    /**
     * Handle user check-in.
     * Creates a new attendance record for the current day.
     */

    public function checkIn(Request $request)
    {
        try {
            // Get the authenticated user
            $user = Auth::user();
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
            }

            $today = Carbon::today();

            // Check if the user has already checked in today
            $existingAttendance = Attendance::where('user_id', $user->id)
                ->whereDate('date', $today)
                ->first();

            if ($existingAttendance) {
                return response()->json(['success' => false, 'message' => 'Anda sudah melakukan check-in hari ini.'], 409);
            }

            // Validate the request data
            $validatedData = $request->validate([
                'location_check_in' => ['required', 'string', 'max:255'],
                'photo_check_in' => ['required', 'image', 'mimes:jpeg,png,jpg,gif,svg', 'max:5120'], // Max 5MB
                'notes' => ['nullable', 'string', 'max:500'],
            ]);

            Log::info('Check-in Request Data:', [
                'user_id' => $user->id,
                'date' => $today->toDateString(),
                'location_check_in' => $validatedData['location_check_in'],
                'notes' => $validatedData['notes'] ?? null,
            ]);

            // Handle the photo upload
            $path = $request->file('photo_check_in')->store('photos/check_in', 'public');

            // Add additional data to the validated data array
            $validatedData['user_id'] = $user->id;
            $validatedData['date'] = $today->toDateString();
            $validatedData['check_in_time'] = now();
            $validatedData['status'] = 'PRESENT';
            $validatedData['photo_check_in'] = $path;

            // Create the attendance record
            Attendance::create($validatedData);

            return response()->json(['success' => true, 'message' => 'Check-in berhasil!'], 201);
        } catch (ValidationException $e) {
            Log::error('Validation failed for check-in:', ['errors' => $e->errors()]);
            return response()->json([
                'success' => false,
                'message' => 'Data yang diberikan tidak valid.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('An unexpected error occurred during check-in:', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan server. Silakan coba lagi.'], 500);
        }
    }

    public function checkOut(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
            }

            $today = Carbon::today();

            // Cari record check-in hari ini
            $attendance = Attendance::where('user_id', $user->id)
                ->whereDate('date', $today)
                ->first();

            if (!$attendance) {
                return response()->json(['success' => false, 'message' => 'Anda belum melakukan check-in hari ini.'], 400);
            }

            if ($attendance->check_out_time) {
                return response()->json(['success' => false, 'message' => 'Anda sudah melakukan check-out hari ini.'], 409);
            }

            // --- Tidak ada perubahan di sini, validasi tetap sama
            $validatedData = $request->validate([
                'location_check_out' => ['required', 'string', 'max:255'],
                'photo_check_out' => ['required', 'image', 'mimes:jpeg,png,jpg,gif,svg', 'max:5120'],
                'notes' => ['nullable', 'string', 'max:500'],
            ]);

            $validatedData['check_out_time'] = now();

            if (Carbon::parse($validatedData['check_out_time'])->lessThan(Carbon::parse($attendance->check_in_time))) {
                return response()->json(['success' => false, 'message' => 'Waktu pulang tidak boleh lebih awal dari waktu masuk.'], 400);
            }

            // Sesuai permintaan Anda, tidak menghapus foto lama.
            $path = $request->file('photo_check_out')->store('photos/check_out', 'public');
            $validatedData['photo_check_out'] = $path;

            $attendance->update($validatedData);

            return response()->json(['success' => true, 'message' => 'Check-out berhasil!'], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data yang diberikan tidak valid.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('An unexpected error occurred during check-out:', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan server. Silakan coba lagi.'], 500);
        }
    }


    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Attendance $attendance)
    {
        return Inertia::render('Attendance/Edit', [
            'attendance' => $attendance->load('user'),
            'users' => User::select('id', 'name')->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Attendance $attendance)
    {
        $validatedData = $request->validate([
            'user_id' => ['sometimes', 'required', 'exists:users,id'],
            'date' => ['sometimes', 'date_format:Y-m-d'],
            'check_in_time' => ['sometimes', 'date_format:Y-m-d H:i:s'],
            'check_out_time' => ['sometimes', 'nullable', 'date_format:Y-m-d H:i:s', 'after:check_in_time'],
            'break_start_time' => ['sometimes', 'nullable', 'date_format:Y-m-d H:i:s', 'after:check_in_time'],
            'break_end_time' => ['sometimes', 'nullable', 'date_format:Y-m-d H:i:s', 'after:break_start_time'],
            'status' => ['sometimes', 'required', Rule::in(['PRESENT', 'ABSENT', 'LEAVE', 'SICK', 'HALF_DAY', 'LATE'])],
            'notes' => ['sometimes', 'nullable', 'string', 'max:500'],
            'location_check_in' => ['sometimes', 'string', 'max:255'],
            'location_check_out' => ['sometimes', 'string', 'max:255'],
            'photo_check_in' => ['sometimes', 'nullable', 'image', 'max:2048'],
            'photo_check_out' => ['sometimes', 'nullable', 'image', 'max:2048'],
        ]);

        if ($request->hasFile('photo_check_in')) {
            if ($attendance->photo_check_in) {
                Storage::disk('public')->delete($attendance->photo_check_in);
            }
            $validatedData['photo_check_in'] = $request->file('photo_check_in')->store('photos/check_in', 'public');
        } elseif (array_key_exists('photo_check_in', $request->all()) && is_null($request->input('photo_check_in'))) {
            if ($attendance->photo_check_in) {
                Storage::disk('public')->delete($attendance->photo_check_in);
            }
            $validatedData['photo_check_in'] = null;
        }

        if ($request->hasFile('photo_check_out')) {
            if ($attendance->photo_check_out) {
                Storage::disk('public')->delete($attendance->photo_check_out);
            }
            $validatedData['photo_check_out'] = $request->file('photo_check_out')->store('photos/check_out', 'public');
        } elseif (array_key_exists('photo_check_out', $request->all()) && is_null($request->input('photo_check_out'))) {
            if ($attendance->photo_check_out) {
                Storage::disk('public')->delete($attendance->photo_check_out);
            }
            $validatedData['photo_check_out'] = null;
        }

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
            return redirect()->back()->with('error', 'Terjadi kesalahan saat menghapus data presensi.');
        }
    }

    public function testFormData(Request $request)
    {
        try {
            Log::info('Test FormData Request:', [
                'all_data' => $request->all(),
                'files' => $request->allFiles(),
                'headers' => $request->headers->all(),
                'content_type' => $request->header('Content-Type'),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'FormData received successfully',
                'received_data' => $request->all(),
                'received_files' => array_keys($request->allFiles()),
                'content_type' => $request->header('Content-Type'),
            ]);
        } catch (\Exception $e) {
            Log::error('Test FormData Error:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }
}
