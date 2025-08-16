<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DataController;
use App\Http\Controllers\AttendanceController;

// Handle preflight OPTIONS requests untuk semua route API
Route::options('/{any}', function (Request $request) {
    return response('', 200)
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
})->where('any', '.*');

// --- Public API Routes (Tidak Membutuhkan Autentikasi) ---
Route::post('/login', [AuthController::class, 'loginApi']);
Route::post('/register', [AuthController::class, 'registerApi']);
// Route::post('/logout', [AuthController::class, 'logoutApi']);


// Test endpoint untuk memastikan API berfungsi
Route::get('/test', function () {
    return response()->json([
        'message' => 'API is working!',
        'timestamp' => now(),
    ]);
});

// --- Protected API Routes (Membutuhkan Autentikasi dengan Sanctum Token) ---
Route::middleware('auth:sanctum')->group(function () {
    // Endpoint untuk mendapatkan data user yang sedang login
    Route::get('/user', [AuthController::class, 'me']);

    // Endpoint untuk logout
    Route::post('/logout', [AuthController::class, 'logoutApi']);

    // Endpoint untuk refresh token
    Route::post('/refresh-token', [AuthController::class, 'refreshToken']);

    // Data Dashboard/Chart (yang membutuhkan autentikasi)
    Route::get('/chart-data', [DataController::class, 'getChartData']);
    Route::get('/outcome-chart-data', [DataController::class, 'getOutcomeChartData']);
    Route::get('/customers-distribution-data', [DataController::class, 'getCustomerPercentageData']);

    // Absensi / Kehadiran
    Route::post('/attendances/check-in', [AttendanceController::class, 'checkIn']);
    Route::patch('/attendances/check-out', [AttendanceController::class, 'checkOut']);
});
