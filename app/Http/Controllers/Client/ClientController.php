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
            'total_consultations' => $user->consultationsAsClient()->count(),
            'completed_consultations' => $user->consultationsAsClient()->where('status', 'completed')->count(),
            'total_spent' => $user->consultationsAsClient()->where('status', 'completed')->sum('total_cost'),
            'wallet_balance' => $user->wallet_balance,
        ];

        $recentConsultations = $user->consultationsAsClient()
            ->with('operator')
            ->latest()
            ->limit(5)
            ->get();

        $favoriteOperators = User::where('role', 'operator')
            ->where('status', 'active')
            ->where('is_online', true)
            ->withCount(['reviews' => function ($query) {
                $query->where('status', 'approved');
            }])
            ->orderBy('reviews_count', 'desc')
            ->limit(6)
            ->get();

        return view('client.dashboard', compact('stats', 'recentConsultations', 'favoriteOperators'));
    }

    public function consultations()
    {
        $consultations = auth()->user()->consultationsAsClient()
            ->with(['operator', 'review'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

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
        $query = User::where('role', 'operator')
            ->where('status', 'active');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('bio', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->specialty) {
            $query->whereJsonContains('specialties', $request->specialty);
        }

        if ($request->online_only) {
            $query->where('is_online', true);
        }

        $operators = $query->withCount(['reviews' => function ($q) {
                $q->where('status', 'approved');
            }])
            ->with(['reviews' => function ($q) {
                $q->where('status', 'approved')->latest()->limit(3);
            }])
            ->paginate(12);

        $specialties = ['Astrologia', 'Tarocchi', 'Cartomanzia', 'Numerologia', 'Cristalloterapia'];

        return view('client.operators', compact('operators', 'specialties'));
    }

    public function showOperator(User $operator)
    {
        if (!$operator->isOperator() || $operator->status !== 'active') {
            abort(404);
        }

        $operator->load(['reviews' => function ($query) {
            $query->where('status', 'approved')->with('client')->latest();
        }]);

        return view('client.operator-detail', compact('operator'));
    }

    public function bookConsultation(User $operator, Request $request)
    {
        $request->validate([
            'type' => 'required|in:chat,call,video',
        ]);

        if (!$operator->isOperator() || $operator->status !== 'active') {
            return back()->with('error', 'Operatore non disponibile.');
        }

        if (auth()->user()->wallet_balance < $operator->hourly_rate) {
            return back()->with('error', 'Saldo insufficiente. Ricarica il tuo portafoglio.');
        }

        $consultation = Consultation::create([
            'client_id' => auth()->id(),
            'operator_id' => $operator->id,
            'type' => $request->type,
            'rate_per_minute' => $operator->hourly_rate / 60,
            'status' => 'pending',
        ]);

        return redirect()->route('client.consultation.show', $consultation)
            ->with('success', 'Consulenza prenotata con successo!');
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
            'description' => 'required|string',
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
}
