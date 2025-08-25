<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    // --- Helper Method untuk CORS Response ---
    private function corsResponse($data, $status = 200)
    {
        return response()->json($data, $status)
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-CSRF-TOKEN')
            ->header('Access-Control-Allow-Credentials', 'true');
    }

    // --- Metode untuk Web/Inertia (Tidak Berubah) ---
    public function showLogin()
    {
        return Inertia::render('auth/login');
    }

    public function showRegister()
    {
        return Inertia::render('auth/register');
    }

    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();

        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();
            return redirect()->intended('/dashboard');
        }

        return back()->withErrors([
            'email' => 'Email atau password tidak sesuai.',
        ]);
    }

    public function register(RegisterRequest $request)
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'username' => $validated['username'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'],
            'address' => $validated['address'],
            'is_admin' => '0', // Default non-admin
        ]);

        Auth::login($user);

        return redirect('/dashboard');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/login');
    }

    // --- Metode Baru untuk API (Untuk Aplikasi React Native) ---

    public function loginApi(Request $request)
    {
        try {
            // Log request untuk debugging
            Log::info('Login API request from React Native', [
                'email' => $request->email,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            // Validasi input dari API request
            $request->validate([
                'email' => ['required', 'string', 'email'],
                'password' => ['required', 'string'],
            ]);

            // Cari user berdasarkan email
            $user = User::where('email', $request->email)->first();

            // Verifikasi kredensial
            if (!$user || !Hash::check($request->password, $user->password)) {
                Log::warning('Login attempt failed', [
                    'email' => $request->email,
                    'ip' => $request->ip()
                ]);

                return $this->corsResponse([
                    'message' => 'Kredensial yang diberikan tidak cocok dengan catatan kami.',
                    'success' => false,
                    'errors' => [
                        'email' => ['Kredensial yang diberikan tidak cocok dengan catatan kami.']
                    ]
                ], 401);
            }

            // Opsional: Hapus semua token lama user ini untuk keamanan
            $user->tokens()->delete();

            // Buat token Sanctum baru
            $token = $user->createToken('mobile-app-' . now()->timestamp)->plainTextToken;

            Log::info('Login successful for user', [
                'user_id' => $user->id,
                'email' => $user->email
            ]);

            // Kembalikan respons sukses dengan token
            return $this->corsResponse([
                'message' => 'Login berhasil!',
                'success' => true,
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'address' => $user->address,
                    'is_admin' => $user->is_admin,
                ],
            ], 200);
        } catch (ValidationException $e) {
            Log::error('Login validation failed', [
                'errors' => $e->errors(),
                'email' => $request->email
            ]);

            return $this->corsResponse([
                'message' => 'Data yang diberikan tidak valid.',
                'success' => false,
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Login API error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->corsResponse([
                'message' => 'Terjadi kesalahan server. Silakan coba lagi.',
                'success' => false,
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    public function registerApi(Request $request)
    {
        try {
            Log::info('Register API request from React Native', [
                'email' => $request->email,
                'name' => $request->name,
                'ip' => $request->ip()
            ]);

            // Validasi input dari API request
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
                'password' => ['required', 'string', 'min:8', 'confirmed'],
                'phone' => ['required', 'string', 'max:20'],
                'address' => ['required', 'string', 'max:255'],
            ]);

            // Buat user baru
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'phone' => $validated['phone'],
                'address' => $validated['address'],
                'is_admin' => '0', // Default non-admin
            ]);

            // Buat token Sanctum setelah registrasi
            $token = $user->createToken('mobile-app-' . now()->timestamp)->plainTextToken;

            Log::info('Registration successful for user', [
                'user_id' => $user->id,
                'email' => $user->email
            ]);

            // Kembalikan respons sukses dengan token
            return $this->corsResponse([
                'message' => 'Registrasi berhasil!',
                'success' => true,
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'username' => $user->username,
                    'phone' => $user->phone,
                    'address' => $user->address,
                    'is_admin' => $user->is_admin,
                ],
            ], 201);
        } catch (ValidationException $e) {
            Log::error('Registration validation failed', [
                'errors' => $e->errors(),
                'email' => $request->email
            ]);

            return $this->corsResponse([
                'message' => 'Data yang diberikan tidak valid.',
                'success' => false,
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Registration API error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->corsResponse([
                'message' => 'Terjadi kesalahan server. Silakan coba lagi.',
                'success' => false,
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    public function logoutApi(Request $request)
    {
        try {
            Log::info('Logout API request', [
                'user_id' => $request->user()->id,
                'email' => $request->user()->email
            ]);

            // Hapus token yang digunakan saat ini oleh user
            $request->user()->currentAccessToken()->delete();

            return $this->corsResponse([
                'message' => 'Logout berhasil.',
                'success' => true
            ], 200);
        } catch (\Exception $e) {
            Log::error('Logout API error', [
                'error' => $e->getMessage(),
                'user_id' => $request->user()->id ?? 'unknown'
            ]);

            return $this->corsResponse([
                'message' => 'Terjadi kesalahan saat logout.',
                'success' => false,
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    // --- Method tambahan untuk API ---

    /**
     * Get authenticated user data for API
     */
    public function me(Request $request)
    {
        try {
            $user = $request->user();

            return $this->corsResponse([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'username' => $user->username,
                    'phone' => $user->phone,
                    'address' => $user->address,
                    'is_admin' => $user->is_admin,
                ]
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get user API error', [
                'error' => $e->getMessage()
            ]);

            return $this->corsResponse([
                'message' => 'Terjadi kesalahan server.',
                'success' => false
            ], 500);
        }
    }

    /**
     * Refresh token for API
     */
    public function refreshToken(Request $request)
    {
        try {
            $user = $request->user();

            // Hapus token lama
            $request->user()->currentAccessToken()->delete();

            // Buat token baru
            $token = $user->createToken('mobile-app-refresh-' . now()->timestamp)->plainTextToken;

            Log::info('Token refreshed for user', [
                'user_id' => $user->id,
                'email' => $user->email
            ]);

            return $this->corsResponse([
                'message' => 'Token berhasil diperbarui.',
                'success' => true,
                'access_token' => $token,
                'token_type' => 'Bearer',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Refresh token API error', [
                'error' => $e->getMessage()
            ]);

            return $this->corsResponse([
                'message' => 'Terjadi kesalahan saat memperbarui token.',
                'success' => false
            ], 500);
        }
    }

    /**
     * Change password for authenticated user (Mobile App)
     */
    public function changePassword(Request $request)
    {
        try {
            $user = $request->user();
            $request->validate([
                'old_password' => ['required', 'string'],
                'new_password' => ['required', 'string', 'min:8'],
            ]);
            if (!Hash::check($request->old_password, $user->password)) {
                return $this->corsResponse([
                    'success' => false,
                    'message' => 'Password lama tidak sesuai.'
                ], 400);
            }
            $user->password = Hash::make($request->new_password);
            $user->save();
            return $this->corsResponse([
                'success' => true,
                'message' => 'Password berhasil diganti.'
            ], 200);
        } catch (ValidationException $e) {
            return $this->corsResponse([
                'success' => false,
                'message' => 'Data tidak valid.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Change password error', [
                'user_id' => $request->user()->id ?? 'unknown',
                'error' => $e->getMessage()
            ]);
            return $this->corsResponse([
                'success' => false,
                'message' => 'Terjadi kesalahan server.'
            ], 500);
        }
    }

    /**
     * Admin reset password for user
     */
    public function adminResetPassword(Request $request, $id)
    {
        try {
            $admin = $request->user();
            if (!$admin->is_admin) {
                return $this->corsResponse([
                    'success' => false,
                    'message' => 'Unauthorized action.'
                ], 403);
            }
            $request->validate([
                'new_password' => ['required', 'string', 'min:8'],
            ]);
            $user = User::find($id);
            if (!$user) {
                return $this->corsResponse([
                    'success' => false,
                    'message' => 'User tidak ditemukan.'
                ], 404);
            }
            $user->password = Hash::make($request->new_password);
            $user->save();
            return $this->corsResponse([
                'success' => true,
                'message' => 'Password user berhasil direset.'
            ], 200);
        } catch (ValidationException $e) {
            return $this->corsResponse([
                'success' => false,
                'message' => 'Data tidak valid.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Admin reset password error', [
                'user_id' => $id,
                'error' => $e->getMessage()
            ]);
            return $this->corsResponse([
                'success' => false,
                'message' => 'Terjadi kesalahan server.'
            ], 500);
        }
    }
}
