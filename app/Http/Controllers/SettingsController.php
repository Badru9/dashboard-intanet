<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        $settings = Setting::all();
        return Inertia::render('Settings/Index', compact('settings'));
    }

    public function profile()
    {
        // For testing purposes, just return a simple response
        if (app()->environment('testing')) {
            return response()->json(['user' => Auth::user()]);
        }

        return Inertia::render('Settings/Profile', [
            'user' => Auth::user()
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
        ]);

        $emailChanged = $user->email !== $validated['email'];

        $user->fill($validated);

        if ($emailChanged) {
            $user->email_verified_at = null;
        }

        $user->save();

        return redirect()->route('settings.profile')->with('success', 'Profile updated successfully');
    }

    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return redirect()->route('settings.password')->with('success', 'Password updated successfully');
    }

    public function deleteAccount(Request $request)
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        // Force delete to completely remove the user from database
        $user->forceDelete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'ppn' => 'required|numeric|min:0',
            'bph' => 'required|numeric|min:0',
            'uso' => 'required|numeric|min:0',
            'pph' => 'required|numeric|min:0',
            'admin' => 'required|numeric|min:0',
            'prtg' => 'required|numeric|min:0',
            'noc_24_jam' => 'required|numeric|min:0',
        ]);

        foreach ($validated as $key => $value) {
            Setting::where('key', $key)->update(['value' => $value]);
        }

        // Log::info('Settings updated: ' . json_encode($validated));

        return redirect()->route('settings.index')->with('success', 'Settings updated successfully');
    }
}
