<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Auth\Events\Registered;

class AuthController extends Controller
{
    public function showLogin()
    {
        if (Auth::check()) {
            return $this->redirectBasedOnRole(Auth::user());
        }
        
        return view('auth.login');
    }

    public function showRegister()
    {
        if (Auth::check()) {
            return $this->redirectBasedOnRole(Auth::user());
        }
        
        return view('auth.register');
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|min:6',
        ], [
            'email.required' => 'L\'email è obbligatoria.',
            'email.email' => 'Inserisci un indirizzo email valido.',
            'password.required' => 'La password è obbligatoria.',
            'password.min' => 'La password deve essere di almeno 6 caratteri.',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials, $request->filled('remember'))) {
            $request->session()->regenerate();
            
            $user = Auth::user();
            
            if ($user->is_suspended) {
                Auth::logout();
                return back()->withErrors([
                    'email' => 'Il tuo account è stato sospeso. Contatta l\'assistenza.',
                ])->withInput();
            }
            
            return $this->redirectBasedOnRole($user);
        }

        return back()->withErrors([
            'email' => 'Le credenziali fornite non corrispondono ai nostri record.',
        ])->withInput();
    }

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:client,operator',
        ], [
            'name.required' => 'Il nome è obbligatorio.',
            'email.required' => 'L\'email è obbligatoria.',
            'email.email' => 'Inserisci un indirizzo email valido.',
            'email.unique' => 'Questo indirizzo email è già registrato.',
            'password.required' => 'La password è obbligatoria.',
            'password.min' => 'La password deve essere di almeno 8 caratteri.',
            'password.confirmed' => 'Le password non corrispondono.',
            'role.required' => 'Seleziona un tipo di account.',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'wallet_balance' => $request->role === 'client' ? 10.00 : 0.00, // Bonus di benvenuto per i clienti
        ]);

        event(new Registered($user));

        Auth::login($user);

        return $this->redirectBasedOnRole($user)->with('success', 'Registrazione completata con successo!');
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login')->with('success', 'Logout effettuato con successo.');
    }

    private function redirectBasedOnRole($user)
    {
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
}
