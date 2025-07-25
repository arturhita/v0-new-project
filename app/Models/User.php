<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'avatar_url',
        'bio',
        'specialties',
        'categories',
        'rate_per_minute',
        'is_available',
        'is_suspended',
        'wallet_balance',
        'availability_schedule',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'specialties' => 'array',
        'categories' => 'array',
        'availability_schedule' => 'array',
        'is_available' => 'boolean',
        'is_suspended' => 'boolean',
        'rate_per_minute' => 'decimal:2',
        'wallet_balance' => 'decimal:2',
    ];

    // Relationships
    public function clientConsultations()
    {
        return $this->hasMany(Consultation::class, 'client_id');
    }

    public function operatorConsultations()
    {
        return $this->hasMany(Consultation::class, 'operator_id');
    }

    public function sentMessages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function clientReviews()
    {
        return $this->hasMany(Review::class, 'client_id');
    }

    public function operatorReviews()
    {
        return $this->hasMany(Review::class, 'operator_id');
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

    // Scopes
    public function scopeOperators($query)
    {
        return $query->where('role', 'operator');
    }

    public function scopeClients($query)
    {
        return $query->where('role', 'client');
    }

    public function scopeAvailable($query)
    {
        return $query->where('is_available', true)->where('is_suspended', false);
    }

    // Helper methods
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

    public function getAverageRating()
    {
        return $this->operatorReviews()->where('status', 'approved')->avg('rating') ?? 0;
    }

    public function getTotalEarnings()
    {
        return $this->operatorConsultations()
            ->where('status', 'completed')
            ->sum('total_cost') ?? 0;
    }

    public function addToWallet($amount, $description, $reference = null)
    {
        $this->increment('wallet_balance', $amount);
        
        $this->walletTransactions()->create([
            'type' => 'credit',
            'amount' => $amount,
            'description' => $description,
            'reference' => $reference,
            'balance_after' => $this->fresh()->wallet_balance,
        ]);
    }

    public function deductFromWallet($amount, $description, $reference = null)
    {
        if ($this->wallet_balance < $amount) {
            throw new \Exception('Saldo insufficiente');
        }

        $this->decrement('wallet_balance', $amount);
        
        $this->walletTransactions()->create([
            'type' => 'debit',
            'amount' => $amount,
            'description' => $description,
            'reference' => $reference,
            'balance_after' => $this->fresh()->wallet_balance,
        ]);
    }
}
