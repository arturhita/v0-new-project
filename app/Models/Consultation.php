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
        'client_notes',
        'operator_notes',
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

    public function calculateCost()
    {
        if ($this->duration_minutes > 0) {
            $this->total_cost = ($this->rate_per_minute * $this->duration_minutes);
            $this->save();
        }
    }
}
