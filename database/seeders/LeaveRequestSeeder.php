<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LeaveRequest;
use App\Models\User;
use Carbon\Carbon;

class LeaveRequestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();
        if ($users->count() === 0) return;

        $leaveTypes = ['annual', 'sick', 'maternity', 'paternity', 'emergency', 'unpaid'];
        $statuses = ['pending', 'approved', 'rejected'];

        foreach ($users as $user) {
            for ($i = 0; $i < 3; $i++) {
                $type = $leaveTypes[array_rand($leaveTypes)];
                $status = $statuses[array_rand($statuses)];
                $start = Carbon::now()->subDays(rand(0, 60))->addDays(rand(0, 10));
                $end = (clone $start)->addDays(rand(1, 5));
                $totalDays = $start->diffInWeekdays($end) + 1;

                LeaveRequest::create([
                    'user_id' => $user->id,
                    'leave_type' => $type,
                    'start_date' => $start->format('Y-m-d'),
                    'end_date' => $end->format('Y-m-d'),
                    'total_days' => $totalDays,
                    'reason' => 'Contoh pengajuan cuti tipe ' . $type . ' oleh ' . $user->name,
                    'status' => $status,
                    'approved_by' => $status !== 'pending' ? $users->random()->id : null,
                    'approved_at' => $status !== 'pending' ? Carbon::now() : null,
                    'rejection_reason' => $status === 'rejected' ? 'Alasan penolakan contoh.' : null,
                    'attachment' => null,
                ]);
            }
        }
    }
}
