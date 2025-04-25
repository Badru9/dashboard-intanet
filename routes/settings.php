<?php

use App\Http\Controllers\SettingsController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/profile', [SettingsController::class, 'profile'])->name('profile');
        Route::get('/company', [SettingsController::class, 'company'])->name('company');
        Route::get('/billing', [SettingsController::class, 'billing'])->name('billing');
        Route::get('/notifications', [SettingsController::class, 'notifications'])->name('notifications');
        Route::get('/security', [SettingsController::class, 'security'])->name('security');
        Route::get('/appearance', [SettingsController::class, 'appearance'])->name('appearance');
    });
});
