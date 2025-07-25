<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Consultation;
use App\Models\Review;
use App\Models\Ticket;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware(function ($request, $next) {
            if (!auth()->user()->isClient()) {
                abort(403, 'Accesso non autorizzato.');
            }
            return $next($request);
        });
    }

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
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $availableOperators = User::operators()
            ->available()
            ->limit(6)
            ->get();

        return view('client.dashboard', compact('stats', 'recentConsultations', 'availableOperators'));
    }

    public function consultations(Request $request)
    {
        $query = auth()->user()->clientConsultations()->with(['operator', 'review']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $consultations = $query->orderBy('created_at', 'desc')->paginate(10);

        return view('client.consultations', compact('consultations'));
    }

    public function operators(Request $request)
    {
        $query = User::operators()->with('operatorReviews');

        if ($request->filled('category')) {
            $query->whereJsonContains('categories', $request->category);
        }

        if ($request->filled('specialty')) {
            $query->whereJsonContains('specialties', $request->specialty);
        }

        if ($request->filled('available_only')) {
            $query->available();
        }

        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('bio', 'like', '%' . $request->search . '%');
            });
        }

        $operators = $query->paginate(12);

        $categories = ['Astrologia', 'Tarocchi', 'Cartomanzia', 'Numerologia', 'Cristalloterapia'];
        $specialties = ['Amore', 'Lavoro', 'Famiglia', 'Salute', 'Spiritualità'];

        return view('client.operators', compact('operators', 'categories', 'specialties'));
    }

    public function showOperator(User $operator)
    {
        if (!$operator->isOperator()) {
            abort(404);
        }

        $operator->load(['operatorReviews' => function($query) {
            $query->where('status', 'approved')->with('client');
        }]);

        return view('client.operator-detail', compact('operator'));
    }

    public function bookConsultation(Request $request, User $operator)
    {
        $request->validate([
            'type' => 'required|in:chat,call,written',
        ]);

        if (!$operator->isOperator() || !$operator->is_available || $operator->is_suspended) {
            return back()->withErrors(['error' => 'L\'operatore non è disponibile al momento.']);
        }

        $consultation = Consultation::create([
            'client_id' => auth()->id(),
            'operator_id' => $operator->id,
            'type' => $request->type,
            'status' => 'pending',
            'rate_per_minute' => $operator->rate_per_minute,
        ]);

        return redirect()->route('client.consultation.show', $consultation)
            ->with('success', 'Consulenza prenotata con successo!');
    }

    public function showConsultation(Consultation $consultation)
    {
        if ($consultation->client_id !== auth()->id()) {
            abort(403);
        }

        $consultation->load(['operator', 'messages.sender']);

        return view('client.consultation-detail', compact('consultation'));
    }

    public function leaveReview(Request $request, Consultation $consultation)
    {
        if ($consultation->client_id !== auth()->id() || $consultation->status !== 'completed') {
            abort(403);
        }

        if ($consultation->review) {
            return back()->withErrors(['error' => 'Hai già lasciato una recensione per questa consulenza.']);
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
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return view('client.wallet', compact('user', 'transactions'));
    }

    public function support()
    {
        $tickets = auth()->user()->tickets()
            ->with('replies')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return view('client.support', compact('tickets'));
    }

    public function createTicket(Request $request)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'description' => 'required|string|max:2000',
            'category' => 'required|string',
            'priority' => 'required|in:low,medium,high,urgent',
        ]);

        Ticket::create([
            'user_id' => auth()->id(),
            'subject' => $request->subject,
            'description' => $request->description,
            'category' => $request->category,
            'priority' => $request->priority,
        ]);

        return back()->with('success', 'Ticket creato con successo!');
    }
}
