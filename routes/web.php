<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Client\ClientController;
use App\Http\Controllers\Operator\OperatorController;
use App\Http\Controllers\HomeController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Homepage
Route::get('/', [HomeController::class, 'index'])->name('home');

// Authentication Routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);
});

Route::post('/logout', [AuthController::class, 'logout'])->name('logout')->middleware('auth');

// Admin Routes
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
    
    // Users Management
    Route::get('/users', [AdminController::class, 'users'])->name('users');
    Route::patch('/users/{user}/suspend', [AdminController::class, 'suspendUser'])->name('users.suspend');
    Route::patch('/users/{user}/approve', [AdminController::class, 'approveOperator'])->name('users.approve');
    Route::delete('/users/{user}', [AdminController::class, 'deleteUser'])->name('users.delete');
    
    // Payouts Management
    Route::get('/payouts', [AdminController::class, 'payouts'])->name('payouts');
    Route::patch('/payouts/{payout}', [AdminController::class, 'updatePayoutStatus'])->name('payouts.update');
    
    // Tickets Management
    Route::get('/tickets', [AdminController::class, 'tickets'])->name('tickets');
    Route::get('/tickets/{ticket}', [AdminController::class, 'showTicket'])->name('tickets.show');
    Route::post('/tickets/{ticket}/reply', [AdminController::class, 'replyToTicket'])->name('tickets.reply');
    
    // Reviews Management
    Route::get('/reviews', [AdminController::class, 'reviews'])->name('reviews');
    Route::patch('/reviews/{review}', [AdminController::class, 'updateReviewStatus'])->name('reviews.update');
});

// Client Routes
Route::middleware(['auth', 'client'])->prefix('client')->name('client.')->group(function () {
    Route::get('/dashboard', [ClientController::class, 'dashboard'])->name('dashboard');
    
    // Consultations
    Route::get('/consultations', [ClientController::class, 'consultations'])->name('consultations');
    Route::get('/consultations/{consultation}', [ClientController::class, 'showConsultation'])->name('consultation.show');
    Route::post('/consultations/{consultation}/review', [ClientController::class, 'leaveReview'])->name('consultation.review');
    
    // Operators
    Route::get('/operators', [ClientController::class, 'operators'])->name('operators');
    Route::get('/operators/{operator}', [ClientController::class, 'showOperator'])->name('operator.show');
    Route::post('/operators/{operator}/book', [ClientController::class, 'bookConsultation'])->name('operator.book');
    
    // Wallet
    Route::get('/wallet', [ClientController::class, 'wallet'])->name('wallet');
    
    // Support
    Route::get('/support', [ClientController::class, 'support'])->name('support');
    Route::post('/support/tickets', [ClientController::class, 'createTicket'])->name('support.ticket.create');
});

// Operator Routes
Route::middleware(['auth', 'operator'])->prefix('operator')->name('operator.')->group(function () {
    Route::get('/dashboard', [OperatorController::class, 'dashboard'])->name('dashboard');
    
    // Consultations
    Route::get('/consultations', [OperatorController::class, 'consultations'])->name('consultations');
    Route::get('/consultations/{consultation}', [OperatorController::class, 'showConsultation'])->name('consultation.show');
    Route::patch('/consultations/{consultation}/accept', [OperatorController::class, 'acceptConsultation'])->name('consultation.accept');
    Route::patch('/consultations/{consultation}/end', [OperatorController::class, 'endConsultation'])->name('consultation.end');
    
    // Profile
    Route::get('/profile', [OperatorController::class, 'profile'])->name('profile');
    Route::patch('/profile', [OperatorController::class, 'updateProfile'])->name('profile.update');
    
    // Payouts
    Route::get('/payouts', [OperatorController::class, 'payouts'])->name('payouts');
    Route::post('/payouts', [OperatorController::class, 'requestPayout'])->name('payouts.request');
    
    // Availability
    Route::get('/availability', [OperatorController::class, 'availability'])->name('availability');
    Route::patch('/availability', [OperatorController::class, 'updateAvailability'])->name('availability.update');
});

// Public Operator Profiles
Route::get('/operators/{operator}', function(\App\Models\User $operator) {
    if (!$operator->isOperator()) {
        abort(404);
    }
    return view('public.operator-profile', compact('operator'));
})->name('public.operator');
