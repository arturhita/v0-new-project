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
            'total_consultations' => $user->consultationsAsOperator()->count(),
            'completed_consultations' => $user->consultationsAsOperator()->where('status', 'completed')->count(),
            'total_earnings' => $user->consultationsAsOperator()->where('status', 'completed')->sum('total_cost') * 0.8, // 80% commission
            'average_rating' => $user->average_rating,
            'total_reviews' => $user->total_reviews,
        ];

        $recentConsultations = $user->consultationsAsOperator()
            ->with('client')
            ->latest()
            ->limit(5)
            ->get();

        $pendingConsultations = $user->consultationsAsOperator()
            ->where('status', 'pending')
            ->with('client')
            ->get();

        return view('operator.dashboard', compact('stats', 'recentConsultations', 'pendingConsultations'));
    }

    public function consultations()
    {
        $consultations = auth()->user()->consultationsAsOperator()
            ->with(['client', 'review'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

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

        $duration = now()->diffInMinutes($consultation->started_at);
        $totalCost = $duration * $consultation->rate_per_minute;

        $consultation->update([
            'status' => 'completed',
            'ended_at' => now(),
            'duration_minutes' => $duration,
            'total_cost' => $totalCost,
            'notes' => $request->notes,
        ]);

        // Deduct from client wallet
        $client = $consultation->client;
        $client->decrement('wallet_balance', $totalCost);

        // Add to operator earnings (80% commission)
        $operatorEarnings = $totalCost * 0.8;
        auth()->user()->increment('wallet_balance', $operatorEarnings);

        return back()->with('success', 'Consulenza completata con successo!');
    }

    public function profile()
    {
        $user = auth()->user();
        return view('operator.profile', compact('user'));
    }

    public function updateProfile(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'bio' => 'nullable|string|max:1000',
            'hourly_rate' => 'required|numeric|min:1|max:500',
            'specialties' => 'nullable|array',
            'avatar' => 'nullable|image|max:2048',
        ]);

        $user = auth()->user();
        $data = $request->only(['name', 'phone', 'bio', 'hourly_rate', 'specialties']);

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
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return view('operator.payouts', compact('user', 'payouts'));
    }

    public function requestPayout(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:10|max:' . auth()->user()->wallet_balance,
            'payment_method' => 'required|string',
            'payment_details' => 'required|array',
        ]);

        PayoutRequest::create([
            'operator_id' => auth()->id(),
            'amount' => $request->amount,
            'payment_method' => $request->payment_method,
            'payment_details' => $request->payment_details,
        ]);

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
            'last_seen' => now(),
        ]);

        return back()->with('success', 'Disponibilità aggiornata con successo!');
    }
}
