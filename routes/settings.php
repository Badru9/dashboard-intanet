<?php

use App\Http\Controllers\SettingsController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/profile', [SettingsController::class, 'profile'])->name('profile');
        Route::patch('/profile', [SettingsController::class, 'updateProfile'])->name('profile.update');
        Route::delete('/profile', [SettingsController::class, 'deleteAccount'])->name('profile.delete');

        Route::get('/password', function () {
            return inertia('Settings/Password');
        })->name('password');
        Route::put('/password', [SettingsController::class, 'updatePassword'])->name('password.update');

        Route::get('/company', [SettingsController::class, 'company'])->name('company');
        Route::get('/billing', [SettingsController::class, 'billing'])->name('billing');
        Route::get('/notifications', [SettingsController::class, 'notifications'])->name('notifications');
        Route::get('/security', [SettingsController::class, 'security'])->name('security');
        Route::get('/appearance', [SettingsController::class, 'appearance'])->name('appearance');
    });
});
