<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        return Inertia::render('Settings/Index');
    }

    public function profile()
    {
        return Inertia::render('Settings/Profile');
    }

    public function company()
    {
        return Inertia::render('Settings/Company');
    }

    public function billing()
    {
        return Inertia::render('Settings/Billing');
    }

    public function notifications()
    {
        return Inertia::render('Settings/Notifications');
    }

    public function security()
    {
        return Inertia::render('Settings/Security');
    }

    public function appearance()
    {
        return Inertia::render('Settings/Appearance');
    }
}
