<?php

namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\PayoutRequest;
use Illuminate\Http\Request;

class OperatorController extends Controller
{
    public function dashboard()
    {
        $user = auth()->user();
        
        $stats = [
            'total_consultations' => $user->operatorConsultations()->count(),
            'active_consultations' => $user->operatorConsultations()->where('status', 'active')->count(),
            'total_earnings' => $user->total_earnings,
            'pending_payouts' => $user->payoutRequests()->where('status', 'pending')->sum('amount'),
            'rating' => $user->rating,
            'reviews_count' => $user->reviews_count,
        ];

        $recentConsultations = $user->operatorConsultations()
            ->with('client')
            ->latest()
            ->take(5)
            ->get();

        $pendingConsultations = $user->operatorConsultations()
            ->where('status', 'pending')
            ->with('client')
            ->latest()
            ->take(3)
            ->get();

        return view('operator.dashboard', compact('stats', 'recentConsultations', 'pendingConsultations'));
    }

    public function consultations()
    {
        $consultations = auth()->user()->operatorConsultations()
            ->with('client')
            ->when(request('status'), function($query, $status) {
                return $query->where('status', $status);
            })
            ->latest()
            ->paginate(15);

        return view('operator.consultations', compact('consultations'));
    }

    public function showConsultation(Consultation $consultation)
    {
        if ($consultation->operator_id !== auth()->id()) {
            abort(403);
        }

        $consultation->load(['client', 'messages.sender', 'review']);
        return view('operator.consultation-detail', compact('consultation'));
    }

    public function acceptConsultation(Consultation $consultation)
    {
        if ($consultation->operator_id !== auth()->id() || $consultation->status !== 'pending') {
            abort(403);
        }

        $consultation->update([
            'status' => 'active',
            'started_at' => now(),
        ]);

        return back()->with('success', 'Consulenza accettata con successo!');
    }

    public function endConsultation(Consultation $consultation, Request $request)
    {
        if ($consultation->operator_id !== auth()->id() || $consultation->status !== 'active') {
            abort(403);
        }

        $request->validate([
            'operator_notes' => 'nullable|string|max:1000',
        ]);

        $duration = now()->diffInMinutes($consultation->started_at);
        
        $consultation->update([
            'status' => 'completed',
            'ended_at' => now(),
            'duration_minutes' => $duration,
            'operator_notes' => $request->operator_notes,
        ]);

        $consultation->calculateCost();

        // Update operator earnings
        $operator = auth()->user();
        $operator->increment('total_earnings', $consultation->total_cost * 0.8); // 80% commission
        $operator->increment('total_consultations');

        return back()->with('success', 'Consulenza completata con successo!');
    }

    public function profile()
    {
        $user = auth()->user();
        $specialties = ['Amore', 'Lavoro', 'Famiglia', 'Spiritualità', 'Tarocchi', 'Astrologia'];
        
        return view('operator.profile', compact('user', 'specialties'));
    }

    public function updateProfile(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'bio' => 'required|string|max:1000',
            'hourly_rate' => 'required|numeric|min:10|max:200',
            'specialties' => 'required|array|min:1',
            'specialties.*' => 'string',
            'avatar' => 'nullable|image|max:2048',
        ]);

        $user = auth()->user();
        $data = $request->except('avatar');

        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $data['avatar'] = $path;
        }

        $user->update($data);

        return back()->with('success', 'Profilo aggiornato con successo!');
    }

    public function payouts()
    {
        $user = auth()->user();
        $payouts = $user->payoutRequests()
            ->latest()
            ->paginate(15);

        return view('operator.payouts', compact('user', 'payouts'));
    }

    public function requestPayout(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:50|max:' . auth()->user()->total_earnings,
            'payment_method' => 'required|string',
            'payment_details' => 'required|array',
        ]);

        auth()->user()->payoutRequests()->create($request->all());

        return back()->with('success', 'Richiesta di pagamento inviata con successo!');
    }

    public function availability()
    {
        $user = auth()->user();
        return view('operator.availability', compact('user'));
    }

    public function updateAvailability(Request $request)
    {
        $request->validate([
            'availability' => 'required|array',
            'is_online' => 'boolean',
        ]);

        auth()->user()->update([
            'availability' => $request->availability,
            'is_online' => $request->boolean('is_online'),
        ]);

        return back()->with('success', 'Disponibilità aggiornata con successo!');
    }
}
