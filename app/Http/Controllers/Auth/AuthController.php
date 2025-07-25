<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class AuthController extends Controller
{
    public function showLogin()
    {
        return view('auth.login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            $user = Auth::user();
            
            // Redirect based on role
            switch ($user->role) {
                case 'admin':
                    return redirect()->intended('/admin/dashboard');
                case 'operator':
                    return redirect()->intended('/operator/dashboard');
                case 'client':
                    return redirect()->intended('/client/dashboard');
                default:
                    return redirect()->intended('/');
            }
        }

        return back()->withErrors([
            'email' => 'Le credenziali fornite non corrispondono ai nostri record.',
        ])->onlyInput('email');
    }

    public function showRegister()
    {
        return view('auth.register');
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => ['required', 'in:client,operator'],
            'phone' => ['nullable', 'string', 'max:20'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'hourly_rate' => ['nullable', 'numeric', 'min:1', 'max:500'],
            'specialties' => ['nullable', 'array'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'phone' => $request->phone,
            'bio' => $request->bio,
            'hourly_rate' => $request->hourly_rate,
            'specialties' => $request->specialties,
            'status' => $request->role === 'operator' ? 'pending' : 'active',
        ]);

        Auth::login($user);

        // Redirect based on role
        switch ($user->role) {
            case 'operator':
                return redirect('/operator/dashboard')->with('success', 'Registrazione completata! Il tuo account è in attesa di approvazione.');
            case 'client':
                return redirect('/client/dashboard')->with('success', 'Registrazione completata con successo!');
            default:
                return redirect('/');
        }
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
