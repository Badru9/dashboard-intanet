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

    /**
     * Get attendance status for current user (API endpoint for mobile app)
     */
    public function getAttendanceStatus(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
            }

            $today = Carbon::today();

            // Get today's attendance record
            $todayAttendance = Attendance::where('user_id', $user->id)
                ->whereDate('date', $today)
                ->first();

            // Get recent attendance records (last 7 days)
            $recentAttendances = Attendance::where('user_id', $user->id)
                ->whereDate('date', '>=', $today->copy()->subDays(6))
                ->orderBy('date', 'desc')
                ->get();

            // Calculate statistics for current month
            $currentMonth = Carbon::now();
            $monthlyStats = $this->calculateMonthlyStats($user->id, $currentMonth);

            $status = [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'today_date' => $today->format('Y-m-d'),
                'today_attendance' => null,
                'has_checked_in_today' => false,
                'has_checked_out_today' => false,
                'can_check_in' => true,
                'can_check_out' => false,
                'recent_attendances' => $recentAttendances,
                'monthly_stats' => $monthlyStats,
            ];

            if ($todayAttendance) {
                $status['today_attendance'] = [
                    'id' => $todayAttendance->id,
                    'date' => $todayAttendance->date,
                    'check_in_time' => $todayAttendance->check_in_time,
                    'check_out_time' => $todayAttendance->check_out_time,
                    'status' => $todayAttendance->status,
                    'location_check_in' => $todayAttendance->location_check_in,
                    'location_check_out' => $todayAttendance->location_check_out,
                    'notes' => $todayAttendance->notes,
                    'working_hours' => $this->calculateWorkingHours($todayAttendance),
                ];

                $status['has_checked_in_today'] = true;
                $status['can_check_in'] = false;

                if ($todayAttendance->check_out_time) {
                    $status['has_checked_out_today'] = true;
                    $status['can_check_out'] = false;
                } else {
                    $status['can_check_out'] = true;
                }
            }

            Log::info('Attendance status retrieved for user:', [
                'user_id' => $user->id,
                'date' => $today->format('Y-m-d'),
                'has_checked_in' => $status['has_checked_in_today'],
                'has_checked_out' => $status['has_checked_out_today'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Status kehadiran berhasil diambil.',
                'data' => $status,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error getting attendance status:', [
                'user_id' => $user->id ?? 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan server. Silakan coba lagi.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get attendance history for current user (API endpoint for mobile app)
     */
    public function getAttendanceHistory(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
            }

            // Validate query parameters
            $validator = Validator::make($request->all(), [
                'month' => 'nullable|integer|between:1,12',
                'year' => 'nullable|integer|between:2020,2100',
                'page' => 'nullable|integer|min:1',
                'per_page' => 'nullable|integer|between:1,100',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Parameter tidak valid.',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Get query parameters with defaults
            $month = $request->input('month', Carbon::now()->month);
            $year = $request->input('year', Carbon::now()->year);
            $perPage = $request->input('per_page', 31); // Default to show full month

            // Create date range for the specified month/year
            $startDate = Carbon::createFromDate($year, $month, 1)->startOfMonth();
            $endDate = Carbon::createFromDate($year, $month, 1)->endOfMonth();

            Log::info('Fetching attendance history:', [
                'user_id' => $user->id,
                'month' => $month,
                'year' => $year,
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
            ]);

            // Query attendance records
            $query = Attendance::where('user_id', $user->id)
                ->whereDate('date', '>=', $startDate)
                ->whereDate('date', '<=', $endDate)
                ->orderBy('date', 'desc');

            // Paginate results
            $attendances = $query->paginate($perPage);

            // Transform attendance data to include calculated fields
            $transformedAttendances = $attendances->through(function ($attendance) {
                return [
                    'id' => $attendance->id,
                    'date' => $attendance->date,
                    'check_in_time' => $attendance->check_in_time,
                    'check_out_time' => $attendance->check_out_time,
                    'break_start_time' => $attendance->break_start_time,
                    'break_end_time' => $attendance->break_end_time,
                    'status' => $attendance->status,
                    'location_check_in' => $attendance->location_check_in,
                    'location_check_out' => $attendance->location_check_out,
                    'notes' => $attendance->notes,
                    'working_hours' => $this->calculateWorkingHours($attendance),
                    'created_at' => $attendance->created_at,
                    'updated_at' => $attendance->updated_at,
                ];
            });

            // Calculate monthly statistics
            $monthlyStats = $this->calculateMonthlyStats($user->id, $startDate);

            // Get summary statistics for the period
            $totalRecords = $attendances->total();
            $presentDays = Attendance::where('user_id', $user->id)
                ->whereDate('date', '>=', $startDate)
                ->whereDate('date', '<=', $endDate)
                ->whereIn('status', ['PRESENT', 'LATE'])
                ->count();

            $absentDays = Attendance::where('user_id', $user->id)
                ->whereDate('date', '>=', $startDate)
                ->whereDate('date', '<=', $endDate)
                ->where('status', 'ABSENT')
                ->count();

            $response = [
                'success' => true,
                'message' => 'Riwayat kehadiran berhasil diambil.',
                'data' => [
                    'attendances' => $transformedAttendances,
                    'pagination' => [
                        'current_page' => $attendances->currentPage(),
                        'last_page' => $attendances->lastPage(),
                        'per_page' => $attendances->perPage(),
                        'total' => $attendances->total(),
                        'from' => $attendances->firstItem(),
                        'to' => $attendances->lastItem(),
                    ],
                    'period' => [
                        'month' => $month,
                        'year' => $year,
                        'month_name' => $startDate->format('F Y'),
                        'start_date' => $startDate->format('Y-m-d'),
                        'end_date' => $endDate->format('Y-m-d'),
                    ],
                    'summary' => [
                        'total_records' => $totalRecords,
                        'present_days' => $presentDays,
                        'absent_days' => $absentDays,
                        'attendance_rate' => $totalRecords > 0 ? round($presentDays / $totalRecords * 100, 1) : 0,
                    ],
                    'monthly_stats' => $monthlyStats,
                ]
            ];

            Log::info('Attendance history retrieved successfully:', [
                'user_id' => $user->id,
                'total_records' => $totalRecords,
                'period' => $startDate->format('F Y'),
            ]);

            return response()->json($response, 200);
        } catch (\Exception $e) {
            Log::error('Error getting attendance history:', [
                'user_id' => $user->id ?? 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan server. Silakan coba lagi.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Calculate working hours from attendance record
     */
    private function calculateWorkingHours(Attendance $attendance)
    {
        if (!$attendance->check_in_time || !$attendance->check_out_time) {
            return null;
        }

        $checkIn = Carbon::parse($attendance->check_in_time);
        $checkOut = Carbon::parse($attendance->check_out_time);

        $totalMinutes = $checkOut->diffInMinutes($checkIn);
        $hours = floor($totalMinutes / 60);
        $minutes = $totalMinutes % 60;

        return [
            'total_minutes' => $totalMinutes,
            'hours' => $hours,
            'minutes' => $minutes,
            'formatted' => sprintf('%02d:%02d', $hours, $minutes),
        ];
    }

    /**
     * Calculate monthly attendance statistics
     */
    private function calculateMonthlyStats($userId, Carbon $month)
    {
        $startOfMonth = $month->copy()->startOfMonth();
        $endOfMonth = $month->copy()->endOfMonth();

        $monthlyAttendances = Attendance::where('user_id', $userId)
            ->whereDate('date', '>=', $startOfMonth)
            ->whereDate('date', '<=', $endOfMonth)
            ->get();

        $totalDays = $monthlyAttendances->count();
        $presentDays = $monthlyAttendances->where('status', 'PRESENT')->count();
        $lateDays = $monthlyAttendances->where('status', 'LATE')->count();
        $absentDays = $monthlyAttendances->where('status', 'ABSENT')->count();
        $leaveDays = $monthlyAttendances->where('status', 'LEAVE')->count();
        $sickDays = $monthlyAttendances->where('status', 'SICK')->count();

        // Calculate total working hours for the month
        $totalWorkingMinutes = 0;
        foreach ($monthlyAttendances as $attendance) {
            if ($attendance->check_in_time && $attendance->check_out_time) {
                $checkIn = Carbon::parse($attendance->check_in_time);
                $checkOut = Carbon::parse($attendance->check_out_time);
                $totalWorkingMinutes += $checkOut->diffInMinutes($checkIn);
            }
        }

        $totalWorkingHours = floor($totalWorkingMinutes / 60);
        $totalWorkingMinutesRemainder = $totalWorkingMinutes % 60;

        return [
            'month' => $month->format('Y-m'),
            'month_name' => $month->format('F Y'),
            'total_days' => $totalDays,
            'present_days' => $presentDays,
            'late_days' => $lateDays,
            'absent_days' => $absentDays,
            'leave_days' => $leaveDays,
            'sick_days' => $sickDays,
            'total_working_hours' => [
                'total_minutes' => $totalWorkingMinutes,
                'hours' => $totalWorkingHours,
                'minutes' => $totalWorkingMinutesRemainder,
                'formatted' => sprintf('%02d:%02d', $totalWorkingHours, $totalWorkingMinutesRemainder),
            ],
            'attendance_rate' => $totalDays > 0 ? round(($presentDays + $lateDays) / $totalDays * 100, 1) : 0,
        ];
    }
}
