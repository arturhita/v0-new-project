<?php

namespace App\Models;

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
        'status',
        'phone',
        'bio',
        'avatar',
        'wallet_balance',
        'hourly_rate',
        'specialties',
        'availability',
        'is_online',
        'last_seen',
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
        'wallet_balance' => 'decimal:2',
        'hourly_rate' => 'decimal:2',
        'is_online' => 'boolean',
        'last_seen' => 'datetime',
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

    public function consultationsAsClient()
    {
        return $this->hasMany(Consultation::class, 'client_id');
    }

    public function consultationsAsOperator()
    {
        return $this->hasMany(Consultation::class, 'operator_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'operator_id');
    }

    public function walletTransactions()
    {
        return $this->hasMany(WalletTransaction::class);
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }

    public function payoutRequests()
    {
        return $this->hasMany(PayoutRequest::class, 'operator_id');
    }

    public function getAverageRatingAttribute()
    {
        return $this->reviews()->where('status', 'approved')->avg('rating') ?? 0;
    }

    public function getTotalReviewsAttribute()
    {
        return $this->reviews()->where('status', 'approved')->count();
    }
}
