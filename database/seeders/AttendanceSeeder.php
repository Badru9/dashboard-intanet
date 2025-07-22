<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Attendance;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon; // Pastikan Carbon diimport

class AttendanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Pastikan tabel kosong sebelum seeding
        DB::table('attendances')->truncate();

        $users = User::all();

        if ($users->isEmpty()) {
            $this->command->info('No users found. Please seed the users table first.');
            return;
        }

        $allPossibleCombinations = collect();
        $startDate = Carbon::now()->subDays(30); // Mulai dari 30 hari yang lalu
        $endDate = Carbon::now(); // Sampai hari ini

        // Buat semua kombinasi unik user_id dan tanggal dalam rentang
        foreach ($users as $user) {
            $currentDate = $startDate->copy();
            while ($currentDate->lte($endDate)) {
                $allPossibleCombinations->push([
                    'user_id' => $user->id,
                    'date' => $currentDate->toDateString(),
                ]);
                $currentDate->addDay();
            }
        }

        // Acak semua kombinasi dan ambil sebagian yang diinginkan
        $numberOfAttendancesToCreate = 100; // Jumlah total attendance yang ingin dibuat
        $selectedCombinations = $allPossibleCombinations->shuffle()->take($numberOfAttendancesToCreate);

        // Sekarang iterasi melalui kombinasi unik yang sudah dipilih
        foreach ($selectedCombinations as $combination) {
            $userId = $combination['user_id'];
            $date = Carbon::parse($combination['date']); // Konversi kembali ke objek Carbon

            // Generate check-in and check-out times
            $checkInHour = rand(7, 9);
            $checkInMinute = rand(0, 59);
            $checkInTime = $date->copy()->setTime($checkInHour, $checkInMinute);

            $checkOutHour = rand(16, 18);
            $checkOutMinute = rand(0, 59);
            $checkOutTime = $date->copy()->setTime($checkOutHour, $checkOutMinute);

            // Simulate a break
            $breakStartTime = null;
            $breakEndTime = null;
            if (rand(0, 9) < 7) {
                $breakStartHour = rand(12, 13);
                $breakStartMinute = rand(0, 59);
                $breakStartTime = $date->copy()->setTime($breakStartHour, $breakStartMinute);
                $breakDuration = rand(30, 90);
                $breakEndTime = $breakStartTime->copy()->addMinutes($breakDuration);
            }

            // Randomly pick a status
            $statusOptions = ['PRESENT', 'ABSENT', 'SICK', 'LEAVE', 'HALF_DAY'];
            $status = fake()->randomElement($statusOptions);
            if ($status === 'PRESENT' && $checkInTime->greaterThan($date->copy()->setTime(9, 15))) {
                $status = 'LATE';
            }

            // Simulate location and photo URLs
            $locationCheckIn = fake()->boolean(80) ? fake()->address() : null; // address() lebih lengkap
            $locationCheckOut = fake()->boolean(80) ? fake()->address() : null;
            $photoCheckIn = fake()->boolean(50) ? 'photos/check_in_' . fake()->md5() . '.jpg' : null;
            $photoCheckOut = fake()->boolean(50) ? 'photos/check_out_' . fake()->md5() . '.jpg' : null;

            // Simulate soft deletion
            $deletedAt = fake()->boolean(10) ? now()->subDays(rand(1, 10)) : null;

            Attendance::create([
                'user_id' => $userId, // Gunakan ID user dari kombinasi unik
                'date' => $date->toDateString(),
                'check_in_time' => $checkInTime,
                'check_out_time' => $checkOutTime,
                'break_start_time' => $breakStartTime,
                'break_end_time' => $breakEndTime,
                'status' => $status,
                'notes' => fake()->optional(0.3)->sentence(),
                'location_check_in' => $locationCheckIn,
                'location_check_out' => $locationCheckOut,
                'photo_check_in' => $photoCheckIn,
                'photo_check_out' => $photoCheckOut,
                'deleted_at' => $deletedAt,
            ]);
        }
        $this->command->info('Attendance seeding completed!');
    }
}
