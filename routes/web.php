<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Client\ClientController;
use App\Http\Controllers\Operator\OperatorController;

// Public routes
Route::get('/', function () {
    return view('welcome');
});

// Authentication routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);
});

Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Admin routes
Route::middleware(['auth', 'admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');
    Route::get('/users', [AdminController::class, 'users'])->name('admin.users');
    Route::patch('/users/{user}/suspend', [AdminController::class, 'suspendUser'])->name('admin.users.suspend');
    Route::get('/payouts', [AdminController::class, 'payouts'])->name('admin.payouts');
    Route::patch('/payouts/{payout}', [AdminController::class, 'updatePayoutStatus'])->name('admin.payouts.update');
    Route::get('/tickets', [AdminController::class, 'tickets'])->name('admin.tickets');
    Route::get('/tickets/{ticket}', [AdminController::class, 'showTicket'])->name('admin.tickets.show');
    Route::post('/tickets/{ticket}/reply', [AdminController::class, 'replyToTicket'])->name('admin.tickets.reply');
});

// Client routes
Route::middleware(['auth'])->prefix('dashboard/client')->group(function () {
    Route::get('/', [ClientController::class, 'dashboard'])->name('client.dashboard');
    // Add more client routes here
});

// Operator routes
Route::middleware(['auth', 'operator'])->prefix('dashboard/operator')->group(function () {
    Route::get('/', [OperatorController::class, 'dashboard'])->name('operator.dashboard');
    // Add more operator routes here
});
