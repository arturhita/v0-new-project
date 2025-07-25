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
        $this->middleware('auth');
        $this->middleware(function ($request, $next) {
            if (!auth()->user()->isOperator()) {
                abort(403, 'Accesso non autorizzato.');
            }
            return $next($request);
        });
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
            'this_month_earnings' => $user->operatorConsultations()
                ->where('status', 'completed')
                ->whereMonth('created_at', now()->month)
                ->sum('total_cost'),
        ];

        $recentConsultations = $user->operatorConsultations()
            ->with('client')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $pendingConsultations = $user->operatorConsultations()
            ->where('status', 'pending')
            ->with('client')
            ->get();

        return view('operator.dashboard', compact('stats', 'recentConsultations', 'pendingConsultations'));
    }

    public function consultations(Request $request)
    {
        $query = auth()->user()->operatorConsultations()->with(['client', 'review']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $consultations = $query->orderBy('created_at', 'desc')->paginate(10);

        return view('operator.consultations', compact('consultations'));
    }

    public function showConsultation(Consultation $consultation)
    {
        if ($consultation->operator_id !== auth()->id()) {
            abort(403);
        }

        $consultation->load(['client', 'messages.sender']);

        return view('operator.consultation-detail', compact('consultation'));
    }

    public function acceptConsultation(Consultation $consultation)
    {
        if ($consultation->operator_id !== auth()->id() || $consultation->status !== 'pending') {
            abort(403);
        }

        $consultation->startConsultation();

        return back()->with('success', 'Consulenza accettata e avviata!');
    }

    public function endConsultation(Request $request, Consultation $consultation)
    {
        if ($consultation->operator_id !== auth()->id() || $consultation->status !== 'active') {
            abort(403);
        }

        $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        $totalCost = $consultation->endConsultation($request->notes);

        return back()->with('success', "Consulenza terminata. Costo totale: €{$totalCost}");
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
            'bio' => 'nullable|string|max:2000',
            'rate_per_minute' => 'required|numeric|min:0.50|max:50.00',
            'specialties' => 'nullable|array',
            'categories' => 'nullable|array',
            'is_available' => 'boolean',
        ]);

        auth()->user()->update([
            'name' => $request->name,
            'bio' => $request->bio,
            'rate_per_minute' => $request->rate_per_minute,
            'specialties' => $request->specialties,
            'categories' => $request->categories,
            'is_available' => $request->boolean('is_available'),
        ]);

        return back()->with('success', 'Profilo aggiornato con successo!');
    }

    public function payouts()
    {
        $payouts = auth()->user()->payoutRequests()
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        $availableEarnings = auth()->user()->getTotalEarnings();
        $pendingPayouts = auth()->user()->payoutRequests()
            ->where('status', 'pending')
            ->sum('amount');

        return view('operator.payouts', compact('payouts', 'availableEarnings', 'pendingPayouts'));
    }

    public function requestPayout(Request $request)
    {
        $user = auth()->user();
        $availableEarnings = $user->getTotalEarnings();
        $pendingPayouts = $user->payoutRequests()->where('status', 'pending')->sum('amount');
        $maxAmount = $availableEarnings - $pendingPayouts;

        $request->validate([
            'amount' => "required|numeric|min:10|max:{$maxAmount}",
            'payment_method' => 'required|string|in:bank_transfer,paypal,stripe',
            'payment_details' => 'required|array',
        ]);

        $user->payoutRequests()->create([
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
            'availability_schedule' => 'nullable|array',
            'is_available' => 'boolean',
        ]);

        auth()->user()->update([
            'availability_schedule' => $request->availability_schedule,
            'is_available' => $request->boolean('is_available'),
        ]);

        return back()->with('success', 'Disponibilità aggiornata con successo!');
    }
}
