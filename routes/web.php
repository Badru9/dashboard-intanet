<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\CashflowCategoryController;
use App\Http\Controllers\CashflowController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\InternetPackageController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DataController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard Route
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Settings Route
    Route::get('settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::patch('settings', [SettingsController::class, 'update'])->name('settings.update');

    // Internet Package Routes
    Route::resource('internet-packages', InternetPackageController::class);
    Route::get('internet-packages/get-packages', [InternetPackageController::class, 'getPackages'])->name('internet-packages.get-packages');

    // Customer Routes
    Route::resource('customers', CustomerController::class);
    Route::get('customers/{customer}/edit', [CustomerController::class, 'edit'])->name('customers.edit');
    Route::patch('customers/{customer}', [CustomerController::class, 'update'])->name('customers.update');
    Route::delete('customers/{customer}', [CustomerController::class, 'destroy'])->name('customers.destroy');
    Route::put('/customers/{customer}/status', [CustomerController::class, 'updateStatus'])->name('customers.update-status');
    Route::post('/customers/import', [CustomerController::class, 'import'])->name('customers.import');
    // Cashflow Category Routes
    Route::resource('cashflow-categories', CashflowCategoryController::class);

    // Cashflow Routes
    Route::resource('cashflows', CashflowController::class);

    // Invoice Routes
    Route::resource('invoices', InvoiceController::class);
    Route::post('invoices/{invoice}/mark-as-paid', [InvoiceController::class, 'markAsPaid'])->name('invoices.mark-as-paid');
    Route::post('invoices/{invoice}/mark-as-unpaid', [InvoiceController::class, 'markAsUnpaid'])->name('invoices.mark-as-unpaid');
    Route::post('invoices/{invoice}/mark-as-cancelled', [InvoiceController::class, 'markAsCancelled'])->name('invoices.mark-as-cancelled');

    // Cashflows Route
    Route::resource('cashflows', CashflowController::class);

    // Route untuk users dengan middleware admin
    Route::middleware('admin')->group(function () {
        Route::resource('users', UserController::class);
    });

    // Presence
    Route::middleware('admin')->group(function () {
        Route::resource('attendances', AttendanceController::class);
    });
    // Route::post('/attendances/check-in', [AttendanceController::class, 'checkIn'])->name('attendances.checkIn');
    // Route::patch('/attendances/check-out', [AttendanceController::class, 'checkOut'])->name('attendances.checkOut');
});

Route::middleware('guest')->group(function () {
    Route::get('login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('login', [AuthController::class, 'login']);
    Route::get('register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('register', [AuthController::class, 'register']);
});

// Route::middleware('api')->group(function () {
//     Route::post('/login', [AuthController::class, 'loginApi']);
//     Route::post('/register', [AuthController::class, 'registerApi']);
//     Route::get('/api/chart-data', [DataController::class, 'getChartData']);
// });

Route::middleware('auth')->group(function () {
    Route::post('logout', [AuthController::class, 'logout'])->name('logout');
});


require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
