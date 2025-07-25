<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Consultation extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'operator_id',
        'type',
        'status',
        'rate_per_minute',
        'duration_minutes',
        'total_cost',
        'started_at',
        'ended_at',
        'notes',
    ];

    protected $casts = [
        'rate_per_minute' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function operator()
    {
        return $this->belongsTo(User::class, 'operator_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function review()
    {
        return $this->hasOne(Review::class);
    }

    public function calculateTotalCost()
    {
        if ($this->duration_minutes && $this->rate_per_minute) {
            return ($this->duration_minutes * $this->rate_per_minute);
        }
        return 0;
    }

    public function startConsultation()
    {
        $this->update([
            'status' => 'active',
            'started_at' => now(),
        ]);
    }

    public function endConsultation($notes = null)
    {
        $endTime = now();
        $duration = $this->started_at->diffInMinutes($endTime);
        $totalCost = $duration * $this->rate_per_minute;

        $this->update([
            'status' => 'completed',
            'ended_at' => $endTime,
            'duration_minutes' => $duration,
            'total_cost' => $totalCost,
            'notes' => $notes,
        ]);

        // Deduct from client wallet
        $this->client->deductFromWallet(
            $totalCost,
            "Consulenza con {$this->operator->name}",
            "consultation_{$this->id}"
        );

        return $totalCost;
    }
}
