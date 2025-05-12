<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        $settings = Setting::all();
        return Inertia::render('Settings/Index', compact('settings'));
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
