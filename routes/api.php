<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ConsultationController;
use App\Http\Controllers\Api\PaymentController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Authentication routes
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
});

// Protected API routes
Route::middleware('auth:sanctum')->group(function () {
    // Consultations
    Route::apiResource('consultations', ConsultationController::class);
    
    // Payments
    Route::prefix('payments')->group(function () {
        Route::post('/create-intent', [PaymentController::class, 'createPaymentIntent']);
        Route::post('/confirm', [PaymentController::class, 'confirmPayment']);
    });
});
