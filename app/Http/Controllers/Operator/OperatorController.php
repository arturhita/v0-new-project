<?php

namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\PayoutRequest;
use Illuminate\Http\Request;

class OperatorController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'operator']);
    }

    public function dashboard()
    {
        $user = auth()->user();
        
        $stats = [
            'total_consultations' => $user->operatorConsultations()->count(),
            'active_consultations' => $user->operatorConsultations()->where('status', 'active')->count(),
            'total_earnings' => $user->getTotalEarnings(),
            'average_rating' => round($user->getAverageRating(), 1),
            'pending_payouts' => $user->payoutRequests()->where('status', 'pending')->sum('amount'),
        ];

        $recentConsultations = $user->operatorConsultations()
            ->with('client')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return view('operator.dashboard', compact('stats', 'recentConsultations'));
    }

    public function consultations()
    {
        $consultations = auth()->user()->operatorConsultations()
            ->with(['client', 'review'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return view('operator.consultations', compact('consultations'));
    }

    public function payouts()
    {
        $payouts = auth()->user()->payoutRequests()
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return view('operator.payouts', compact('payouts'));
    }

    public function requestPayout(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:10|max:' . auth()->user()->getTotalEarnings(),
            'payment_method' => 'required|string',
            'payment_details' => 'required|array',
        ]);

        auth()->user()->payoutRequests()->create([
            'amount' => $request->amount,
            'payment_method' => $request->payment_method,
            'payment_details' => $request->payment_details,
        ]);

        return back()->with('success', 'Richiesta di pagamento inviata con successo.');
    }
}
