<?php

namespace App\Http\Controllers;

use App\Models\LeaveRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class LeaveRequestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = LeaveRequest::query()->with(['user', 'approver']);

            Log::info('Leave Request Index Request Data:', [
                'search' => $request->search,
                'status' => $request->status,
                'leave_type' => $request->leave_type,
                'page' => $request->page,
            ]);

            // Search functionality
            if ($request->filled('search')) {
                $search = $request->search;
                $lowerSearch = strtolower($search);

                $query->where(function ($q) use ($lowerSearch) {
                    $q->where(DB::raw('lower(reason)'), 'like', '%' . $lowerSearch . '%')
                        ->orWhere(DB::raw('lower(leave_type)'), 'like', '%' . $lowerSearch . '%')
                        ->orWhereHas('user', function ($qUser) use ($lowerSearch) {
                            $qUser->where(DB::raw('lower(name)'), 'like', '%' . $lowerSearch . '%')
                                ->orWhere(DB::raw('lower(email)'), 'like', '%' . $lowerSearch . '%');
                        });
                });
            }

            // Filter by status
            if ($request->filled('status') && $request->status !== 'all') {
                $query->where('status', $request->input('status'));
            }

            // Filter by leave type
            if ($request->filled('leave_type') && $request->leave_type !== 'all') {
                $query->where('leave_type', $request->input('leave_type'));
            }

            // If not admin, only show own leave requests
            if (!Auth::user()->isAdmin()) {
                $query->where('user_id', Auth::id());
            }

            $leaveRequests = $query->orderBy('created_at', 'desc')
                ->paginate(10)
                ->withQueryString();

            Log::info('Leave Request Final Result:', [
                'total_data' => $leaveRequests->total(),
                'current_page' => $leaveRequests->currentPage(),
                'per_page' => $leaveRequests->perPage()
            ]);

            $users = User::select('id', 'name')->get();

            return Inertia::render('LeaveRequests/Index', [
                'leaveRequests' => $leaveRequests,
                'filters' => $request->only(['search', 'status', 'leave_type']),
                'users' => $users,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in Leave Request Index:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()->with('error', 'Terjadi kesalahan saat memuat data pengajuan cuti.');
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'leave_type' => ['required', Rule::in(['annual', 'sick', 'maternity', 'paternity', 'emergency', 'unpaid'])],
                'start_date' => ['required', 'date', 'after_or_equal:today'],
                'end_date' => ['required', 'date', 'after_or_equal:start_date'],
                'reason' => ['required', 'string', 'max:1000'],
                'attachment' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'], // Max 5MB
            ]);

            // Calculate total days
            $startDate = Carbon::parse($validatedData['start_date']);
            $endDate = Carbon::parse($validatedData['end_date']);
            $totalDays = $this->calculateBusinessDays($startDate, $endDate);

            // Handle file upload
            if ($request->hasFile('attachment')) {
                $validatedData['attachment'] = $request->file('attachment')->store('leave_attachments', 'public');
            }

            $validatedData['user_id'] = Auth::id();
            $validatedData['total_days'] = $totalDays;
            $validatedData['status'] = 'pending';

            LeaveRequest::create($validatedData);

            return redirect()->route('leave-requests.index')
                ->with('success', 'Pengajuan cuti berhasil disubmit.');
        } catch (ValidationException $e) {
            Log::error('Leave Request validation failed:', ['errors' => $e->errors()]);
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            Log::error('Error creating leave request:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()->with('error', 'Terjadi kesalahan saat menyimpan pengajuan cuti.');
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(LeaveRequest $leaveRequest)
    {
        // Only allow user to edit their own leave request or admin
        if (!Auth::user()->isAdmin() && $leaveRequest->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        // Only allow editing if status is pending
        if (!$leaveRequest->canBeModified()) {
            return redirect()->route('leave-requests.index')
                ->with('error', 'Pengajuan cuti yang sudah diproses tidak dapat diubah.');
        }

        return Inertia::render('LeaveRequests/Edit', [
            'leaveRequest' => $leaveRequest->load('user'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, LeaveRequest $leaveRequest)
    {
        try {
            // Only allow user to edit their own leave request or admin
            if (!Auth::user()->isAdmin() && $leaveRequest->user_id !== Auth::id()) {
                abort(403, 'Unauthorized action.');
            }

            // Only allow editing if status is pending
            if (!$leaveRequest->canBeModified()) {
                return redirect()->route('leave-requests.index')
                    ->with('error', 'Pengajuan cuti yang sudah diproses tidak dapat diubah.');
            }

            $validatedData = $request->validate([
                'leave_type' => ['required', Rule::in(['annual', 'sick', 'maternity', 'paternity', 'emergency', 'unpaid'])],
                'start_date' => ['required', 'date', 'after_or_equal:today'],
                'end_date' => ['required', 'date', 'after_or_equal:start_date'],
                'reason' => ['required', 'string', 'max:1000'],
                'attachment' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            ]);

            // Calculate total days
            $startDate = Carbon::parse($validatedData['start_date']);
            $endDate = Carbon::parse($validatedData['end_date']);
            $validatedData['total_days'] = $this->calculateBusinessDays($startDate, $endDate);

            // Handle file upload
            if ($request->hasFile('attachment')) {
                // Delete old attachment if exists
                if ($leaveRequest->attachment) {
                    Storage::disk('public')->delete($leaveRequest->attachment);
                }
                $validatedData['attachment'] = $request->file('attachment')->store('leave_attachments', 'public');
            }

            $leaveRequest->update($validatedData);

            return redirect()->route('leave-requests.index')
                ->with('success', 'Pengajuan cuti berhasil diperbarui.');
        } catch (ValidationException $e) {
            Log::error('Leave Request update validation failed:', ['errors' => $e->errors()]);
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            Log::error('Error updating leave request:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()->with('error', 'Terjadi kesalahan saat memperbarui pengajuan cuti.');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(LeaveRequest $leaveRequest)
    {
        try {
            // Only allow user to delete their own leave request or admin
            if (!Auth::user()->isAdmin() && $leaveRequest->user_id !== Auth::id()) {
                abort(403, 'Unauthorized action.');
            }

            // Only allow deletion if status is pending
            if (!$leaveRequest->canBeModified()) {
                return redirect()->route('leave-requests.index')
                    ->with('error', 'Pengajuan cuti yang sudah diproses tidak dapat dihapus.');
            }

            // Delete attachment if exists
            if ($leaveRequest->attachment) {
                Storage::disk('public')->delete($leaveRequest->attachment);
            }

            $leaveRequest->delete();

            return redirect()->route('leave-requests.index')
                ->with('success', 'Pengajuan cuti berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error('Error deleting leave request:', [
                'leave_request_id' => $leaveRequest->id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()->with('error', 'Terjadi kesalahan saat menghapus pengajuan cuti.');
        }
    }

    /**
     * Approve a leave request (Admin only).
     */
    public function approve(Request $request, LeaveRequest $leaveRequest)
    {
        try {
            // Only admin can approve
            if (!Auth::user()->isAdmin()) {
                return response()->json(['success' => false, 'message' => 'Unauthorized action.'], 403);
            }

            if (!$leaveRequest->isPending()) {
                return response()->json(['success' => false, 'message' => 'Pengajuan cuti sudah diproses sebelumnya.'], 400);
            }

            $leaveRequest->update([
                'status' => 'approved',
                'approved_by' => Auth::id(),
                'approved_at' => now(),
                'rejection_reason' => null,
            ]);

            Log::info('Leave request approved:', [
                'leave_request_id' => $leaveRequest->id,
                'approved_by' => Auth::id(),
            ]);

            return response()->json(['success' => true, 'message' => 'Pengajuan cuti berhasil disetujui.'], 200);
        } catch (\Exception $e) {
            Log::error('Error approving leave request:', [
                'leave_request_id' => $leaveRequest->id,
                'error' => $e->getMessage()
            ]);
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan server.'], 500);
        }
    }

    /**
     * Reject a leave request (Admin only).
     */
    public function reject(Request $request, LeaveRequest $leaveRequest)
    {
        try {
            // Only admin can reject
            if (!Auth::user()->isAdmin()) {
                return response()->json(['success' => false, 'message' => 'Unauthorized action.'], 403);
            }

            if (!$leaveRequest->isPending()) {
                return response()->json(['success' => false, 'message' => 'Pengajuan cuti sudah diproses sebelumnya.'], 400);
            }

            $validatedData = $request->validate([
                'rejection_reason' => ['required', 'string', 'max:500'],
            ]);

            $leaveRequest->update([
                'status' => 'rejected',
                'approved_by' => Auth::id(),
                'approved_at' => now(),
                'rejection_reason' => $validatedData['rejection_reason'],
            ]);

            Log::info('Leave request rejected:', [
                'leave_request_id' => $leaveRequest->id,
                'rejected_by' => Auth::id(),
                'reason' => $validatedData['rejection_reason'],
            ]);

            return response()->json(['success' => true, 'message' => 'Pengajuan cuti berhasil ditolak.'], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data yang diberikan tidak valid.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error rejecting leave request:', [
                'leave_request_id' => $leaveRequest->id,
                'error' => $e->getMessage()
            ]);
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan server.'], 500);
        }
    }

    // API Methods for Mobile App

    /**
     * Get leave requests for API (Mobile App).
     */
    public function getLeaveRequestsApi(Request $request)
    {
        try {
            $user = Auth::user();
            $query = LeaveRequest::query()->with(['user', 'approver']);

            // If not admin, only show own leave requests
            if (!$user->isAdmin()) {
                $query->where('user_id', $user->id);
            }

            // Apply filters
            if ($request->filled('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            if ($request->filled('leave_type') && $request->leave_type !== 'all') {
                $query->where('leave_type', $request->leave_type);
            }

            $leaveRequests = $query->orderBy('created_at', 'desc')
                ->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $leaveRequests,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error getting leave requests API:', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan server.'], 500);
        }
    }

    /**
     * Create leave request via API (Mobile App).
     */
    public function storeApi(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'leave_type' => ['required', Rule::in(['annual', 'sick', 'maternity', 'paternity', 'emergency', 'unpaid'])],
                'start_date' => ['required', 'date', 'after_or_equal:today'],
                'end_date' => ['required', 'date', 'after_or_equal:start_date'],
                'reason' => ['required', 'string', 'max:1000'],
                'attachment' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            ]);

            // Calculate total days
            $startDate = Carbon::parse($validatedData['start_date']);
            $endDate = Carbon::parse($validatedData['end_date']);
            $totalDays = $this->calculateBusinessDays($startDate, $endDate);

            // Handle file upload
            if ($request->hasFile('attachment')) {
                $validatedData['attachment'] = $request->file('attachment')->store('leave_attachments', 'public');
            }

            $validatedData['user_id'] = Auth::id();
            $validatedData['total_days'] = $totalDays;
            $validatedData['status'] = 'pending';

            $leaveRequest = LeaveRequest::create($validatedData);

            return response()->json([
                'success' => true,
                'message' => 'Pengajuan cuti berhasil disubmit.',
                'data' => $leaveRequest->load(['user', 'approver']),
            ], 201);
        } catch (ValidationException $e) {
            Log::error('Leave Request API validation failed:', ['errors' => $e->errors()]);
            return response()->json([
                'success' => false,
                'message' => 'Data yang diberikan tidak valid.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error creating leave request API:', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan server.'], 500);
        }
    }

    /**
     * Calculate business days between two dates.
     */
    private function calculateBusinessDays(Carbon $startDate, Carbon $endDate)
    {
        $totalDays = 0;
        $current = $startDate->copy();

        while ($current->lte($endDate)) {
            if ($current->isWeekday()) {
                $totalDays++;
            }
            $current->addDay();
        }

        return $totalDays;
    }

    /**
     * Delete leave request via API (Mobile App).
     */
    public function deleteLeaveRequestApi(Request $request, $id)
    {
        try {
            $user = Auth::user();
            $leaveRequest = LeaveRequest::find($id);
            if (!$leaveRequest) {
                return response()->json(['success' => false, 'message' => 'Pengajuan cuti tidak ditemukan.'], 404);
            }
            // Only allow user to delete their own leave request or admin
            if (!$user->isAdmin() && $leaveRequest->user_id !== $user->id) {
                return response()->json(['success' => false, 'message' => 'Unauthorized action.'], 403);
            }
            // Only allow deletion if status is pending
            if (!$leaveRequest->canBeModified()) {
                return response()->json(['success' => false, 'message' => 'Pengajuan cuti yang sudah diproses tidak dapat dihapus.'], 400);
            }
            // Delete attachment if exists
            if ($leaveRequest->attachment) {
                Storage::disk('public')->delete($leaveRequest->attachment);
            }
            $leaveRequest->delete();
            return response()->json(['success' => true, 'message' => 'Pengajuan cuti berhasil dihapus.'], 200);
        } catch (\Exception $e) {
            Log::error('Error deleting leave request API:', [
                'leave_request_id' => $id,
                'error' => $e->getMessage()
            ]);
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan server.'], 500);
        }
    }
}
