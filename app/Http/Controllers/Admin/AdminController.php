<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Consultation;
use App\Models\PayoutRequest;
use App\Models\Ticket;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'admin']);
    }

    public function dashboard()
    {
        $stats = [
            'total_users' => User::count(),
            'total_operators' => User::operators()->count(),
            'total_clients' => User::clients()->count(),
            'active_consultations' => Consultation::where('status', 'active')->count(),
            'pending_payouts' => PayoutRequest::where('status', 'pending')->count(),
            'open_tickets' => Ticket::where('status', 'open')->count(),
            'monthly_revenue' => Consultation::where('status', 'completed')
                ->whereMonth('created_at', now()->month)
                ->sum('total_cost'),
            'pending_reviews' => Review::where('status', 'pending')->count(),
        ];

        $recentConsultations = Consultation::with(['client', 'operator'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $topOperators = User::operators()
            ->withCount('operatorConsultations')
            ->orderBy('operator_consultations_count', 'desc')
            ->limit(5)
            ->get();

        return view('admin.dashboard', compact('stats', 'recentConsultations', 'topOperators'));
    }

    public function users(Request $request)
    {
        $query = User::with(['clientConsultations', 'operatorConsultations']);

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('status')) {
            if ($request->status === 'suspended') {
                $query->where('is_suspended', true);
            } elseif ($request->status === 'active') {
                $query->where('is_suspended', false);
            }
        }

        $users = $query->paginate(20);

        return view('admin.users', compact('users'));
    }

    public function suspendUser(Request $request, User $user)
    {
        if ($user->isAdmin()) {
            return back()->withErrors(['error' => 'Non puoi sospendere un amministratore.']);
        }

        $user->update(['is_suspended' => !$user->is_suspended]);

        $status = $user->is_suspended ? 'sospeso' : 'riattivato';
        
        return back()->with('success', "Utente {$status} con successo.");
    }

    public function deleteUser(User $user)
    {
        if ($user->isAdmin()) {
            return back()->withErrors(['error' => 'Non puoi eliminare un amministratore.']);
        }

        $user->delete();
        
        return back()->with('success', 'Utente eliminato con successo.');
    }

    public function payouts(Request $request)
    {
        $query = PayoutRequest::with('operator');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->whereHas('operator', function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        $payouts = $query->orderBy('created_at', 'desc')->paginate(20);

        return view('admin.payouts', compact('payouts'));
    }

    public function updatePayoutStatus(Request $request, PayoutRequest $payout)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected,paid',
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        switch ($request->status) {
            case 'approved':
                $payout->approve($request->admin_notes);
                break;
            case 'rejected':
                $payout->reject($request->admin_notes);
                break;
            case 'paid':
                $payout->markAsPaid($request->admin_notes);
                break;
        }

        return back()->with('success', 'Stato del pagamento aggiornato con successo.');
    }

    public function tickets(Request $request)
    {
        $query = Ticket::with(['user', 'replies']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('subject', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        $tickets = $query->orderBy('created_at', 'desc')->paginate(20);

        return view('admin.tickets', compact('tickets'));
    }

    public function showTicket(Ticket $ticket)
    {
        $ticket->load(['user', 'replies.user']);
        
        return view('admin.ticket-detail', compact('ticket'));
    }

    public function replyToTicket(Request $request, Ticket $ticket)
    {
        $request->validate([
            'message' => 'required|string|max:2000',
            'status' => 'nullable|in:open,in_progress,resolved,closed',
        ]);

        $ticket->replies()->create([
            'user_id' => auth()->id(),
            'message' => $request->message,
            'is_admin_reply' => true,
        ]);

        if ($request->filled('status')) {
            $ticket->update(['status' => $request->status]);
        }

        return back()->with('success', 'Risposta inviata con successo.');
    }

    public function reviews(Request $request)
    {
        $query = Review::with(['client', 'operator', 'consultation']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('rating')) {
            $query->where('rating', $request->rating);
        }

        $reviews = $query->orderBy('created_at', 'desc')->paginate(20);

        return view('admin.reviews', compact('reviews'));
    }

    public function updateReviewStatus(Request $request, Review $review)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        if ($request->status === 'approved') {
            $review->approve();
        } else {
            $review->reject();
        }

        return back()->with('success', 'Stato della recensione aggiornato con successo.');
    }

    public function analytics()
    {
        $monthlyStats = DB::table('consultations')
            ->select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('COUNT(*) as total_consultations'),
                DB::raw('SUM(total_cost) as total_revenue')
            )
            ->where('status', 'completed')
            ->whereYear('created_at', now()->year)
            ->groupBy('month')
            ->get();

        $operatorStats = User::operators()
            ->withCount('operatorConsultations')
            ->with(['operatorReviews' => function($query) {
                $query->where('status', 'approved');
            }])
            ->get()
            ->map(function($operator) {
                return [
                    'name' => $operator->name,
                    'consultations' => $operator->operator_consultations_count,
                    'rating' => $operator->getAverageRating(),
                    'earnings' => $operator->getTotalEarnings(),
                ];
            });

        return view('admin.analytics', compact('monthlyStats', 'operatorStats'));
    }
}
