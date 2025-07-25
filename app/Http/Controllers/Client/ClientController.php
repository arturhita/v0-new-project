<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Consultation;
use App\Models\Review;
use App\Models\Ticket;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function dashboard()
    {
        $user = auth()->user();
        
        $stats = [
            'total_consultations' => $user->clientConsultations()->count(),
            'active_consultations' => $user->clientConsultations()->where('status', 'active')->count(),
            'wallet_balance' => $user->wallet_balance,
            'total_spent' => $user->clientConsultations()->where('status', 'completed')->sum('total_cost'),
        ];

        $recentConsultations = $user->clientConsultations()
            ->with('operator')
            ->latest()
            ->take(5)
            ->get();

        $favoriteOperators = User::where('role', 'operator')
            ->where('is_approved', true)
            ->where('is_online', true)
            ->orderBy('rating', 'desc')
            ->take(4)
            ->get();

        return view('client.dashboard', compact('stats', 'recentConsultations', 'favoriteOperators'));
    }

    public function consultations()
    {
        $consultations = auth()->user()->clientConsultations()
            ->with('operator')
            ->when(request('status'), function($query, $status) {
                return $query->where('status', $status);
            })
            ->latest()
            ->paginate(15);

        return view('client.consultations', compact('consultations'));
    }

    public function showConsultation(Consultation $consultation)
    {
        if ($consultation->client_id !== auth()->id()) {
            abort(403);
        }

        $consultation->load(['operator', 'messages.sender', 'review']);
        return view('client.consultation-detail', compact('consultation'));
    }

    public function operators(Request $request)
    {
        $operators = User::where('role', 'operator')
            ->where('is_approved', true)
            ->where('is_suspended', false)
            ->when($request->specialty, function($query, $specialty) {
                return $query->whereJsonContains('specialties', $specialty);
            })
            ->when($request->search, function($query, $search) {
                return $query->where('name', 'like', "%{$search}%");
            })
            ->when($request->online_only, function($query) {
                return $query->where('is_online', true);
            })
            ->withCount('reviews')
            ->orderBy($request->sort ?? 'rating', 'desc')
            ->paginate(12);

        $specialties = ['Amore', 'Lavoro', 'Famiglia', 'Spiritualità', 'Tarocchi', 'Astrologia'];

        return view('client.operators', compact('operators', 'specialties'));
    }

    public function showOperator(User $operator)
    {
        if (!$operator->isOperator() || !$operator->is_approved) {
            abort(404);
        }

        $operator->load(['reviews' => function($query) {
            $query->where('status', 'approved')->with('client')->latest();
        }]);

        return view('client.operator-detail', compact('operator'));
    }

    public function bookConsultation(User $operator, Request $request)
    {
        $request->validate([
            'type' => 'required|in:chat,call,video',
            'notes' => 'nullable|string|max:500',
        ]);

        if (!$operator->isOperator() || !$operator->is_approved || !$operator->is_online) {
            return back()->with('error', 'Operatore non disponibile.');
        }

        $consultation = Consultation::create([
            'client_id' => auth()->id(),
            'operator_id' => $operator->id,
            'type' => $request->type,
            'rate_per_minute' => $operator->hourly_rate / 60,
            'client_notes' => $request->notes,
        ]);

        return redirect()->route('client.consultation.show', $consultation)
            ->with('success', 'Consulenza prenotata con successo!');
    }

    public function leaveReview(Consultation $consultation, Request $request)
    {
        if ($consultation->client_id !== auth()->id() || $consultation->status !== 'completed') {
            abort(403);
        }

        if ($consultation->review) {
            return back()->with('error', 'Hai già lasciato una recensione per questa consulenza.');
        }

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        Review::create([
            'consultation_id' => $consultation->id,
            'client_id' => auth()->id(),
            'operator_id' => $consultation->operator_id,
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        return back()->with('success', 'Recensione inviata con successo!');
    }

    public function wallet()
    {
        $user = auth()->user();
        $transactions = $user->walletTransactions()
            ->latest()
            ->paginate(20);

        return view('client.wallet', compact('user', 'transactions'));
    }

    public function support()
    {
        $tickets = auth()->user()->tickets()
            ->with('replies')
            ->latest()
            ->paginate(10);

        return view('client.support', compact('tickets'));
    }

    public function createTicket(Request $request)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string',
            'priority' => 'required|in:low,medium,high,urgent',
        ]);

        auth()->user()->tickets()->create($request->all());

        return back()->with('success', 'Ticket creato con successo!');
    }
}
