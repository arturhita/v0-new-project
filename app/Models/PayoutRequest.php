<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PayoutRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'operator_id',
        'amount',
        'status',
        'payment_method',
        'payment_details',
        'admin_notes',
        'processed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_details' => 'array',
        'processed_at' => 'datetime',
    ];

    public function operator()
    {
        return $this->belongsTo(User::class, 'operator_id');
    }

    public function approve($adminNotes = null)
    {
        $this->update([
            'status' => 'approved',
            'admin_notes' => $adminNotes,
            'processed_at' => now(),
        ]);
    }

    public function reject($adminNotes = null)
    {
        $this->update([
            'status' => 'rejected',
            'admin_notes' => $adminNotes,
            'processed_at' => now(),
        ]);
    }

    public function markAsPaid($adminNotes = null)
    {
        $this->update([
            'status' => 'paid',
            'admin_notes' => $adminNotes,
            'processed_at' => now(),
        ]);
    }
}
