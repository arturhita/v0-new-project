<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'bio',
        'avatar',
        'wallet_balance',
        'hourly_rate',
        'specialties',
        'availability',
        'is_online',
        'is_approved',
        'is_suspended',
        'total_earnings',
        'total_consultations',
        'rating',
        'reviews_count',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'specialties' => 'array',
        'availability' => 'array',
        'is_online' => 'boolean',
        'is_approved' => 'boolean',
        'is_suspended' => 'boolean',
        'wallet_balance' => 'decimal:2',
        'hourly_rate' => 'decimal:2',
        'total_earnings' => 'decimal:2',
        'rating' => 'decimal:2',
    ];

    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isOperator()
    {
        return $this->role === 'operator';
    }

    public function isClient()
    {
        return $this->role === 'client';
    }

    public function clientConsultations()
    {
        return $this->hasMany(Consultation::class, 'client_id');
    }

    public function operatorConsultations()
    {
        return $this->hasMany(Consultation::class, 'operator_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'operator_id');
    }

    public function givenReviews()
    {
        return $this->hasMany(Review::class, 'client_id');
    }

    public function payoutRequests()
    {
        return $this->hasMany(PayoutRequest::class, 'operator_id');
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }

    public function walletTransactions()
    {
        return $this->hasMany(WalletTransaction::class);
    }

    public function updateRating()
    {
        $reviews = $this->reviews()->where('status', 'approved');
        $this->rating = $reviews->avg('rating') ?? 0;
        $this->reviews_count = $reviews->count();
        $this->save();
    }
}
