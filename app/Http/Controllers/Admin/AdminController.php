<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Consultation;
use App\Models\PayoutRequest;
use App\Models\Ticket;
use App\Models\Review;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function dashboard()
    {
        $stats = [
            'total_users' => User::count(),
            'total_operators' => User::where('role', 'operator')->count(),
            'pending_operators' => User::where('role', 'operator')->where('is_approved', false)->count(),
            'total_consultations' => Consultation::count(),
            'active_consultations' => Consultation::where('status', 'active')->count(),
            'total_revenue' => Consultation::where('status', 'completed')->sum('total_cost'),
            'pending_payouts' => PayoutRequest::where('status', 'pending')->sum('amount'),
            'open_tickets' => Ticket::where('status', 'open')->count(),
        ];

        $recentConsultations = Consultation::with(['client', 'operator'])
            ->latest()
            ->take(10)
            ->get();

        $pendingOperators = User::where('role', 'operator')
            ->where('is_approved', false)
            ->latest()
            ->take(5)
            ->get();

        return view('admin.dashboard', compact('stats', 'recentConsultations', 'pendingOperators'));
    }

    public function users()
    {
        $users = User::when(request('role'), function($query, $role) {
            return $query->where('role', $role);
        })
        ->when(request('search'), function($query, $search) {
            return $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
        })
        ->paginate(20);

        return view('admin.users', compact('users'));
    }

    public function suspendUser(User $user)
    {
        $user->update(['is_suspended' => !$user->is_suspended]);
        
        $status = $user->is_suspended ? 'sospeso' : 'riattivato';
        return back()->with('success', "Utente {$status} con successo.");
    }

    public function approveOperator(User $user)
    {
        if ($user->role !== 'operator') {
            return back()->with('error', 'Questo utente non è un operatore.');
        }

        $user->update(['is_approved' => true]);
        return back()->with('success', 'Operatore approvato con successo.');
    }

    public function payouts()
    {
        $payouts = PayoutRequest::with('operator')
            ->when(request('status'), function($query, $status) {
                return $query->where('status', $status);
            })
            ->latest()
            ->paginate(20);

        return view('admin.payouts', compact('payouts'));
    }

    public function updatePayoutStatus(PayoutRequest $payout, Request $request)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected,paid',
            'admin_notes' => 'nullable|string',
        ]);

        $payout->update([
            'status' => $request->status,
            'admin_notes' => $request->admin_notes,
            'processed_at' => now(),
        ]);

        return back()->with('success', 'Stato del pagamento aggiornato con successo.');
    }

    public function tickets()
    {
        $tickets = Ticket::with('user')
            ->when(request('status'), function($query, $status) {
                return $query->where('status', $status);
            })
            ->latest()
            ->paginate(20);

        return view('admin.tickets', compact('tickets'));
    }

    public function showTicket(Ticket $ticket)
    {
        $ticket->load(['user', 'replies.user']);
        return view('admin.ticket-detail', compact('ticket'));
    }

    public function replyToTicket(Ticket $ticket, Request $request)
    {
        $request->validate([
            'message' => 'required|string',
        ]);

        $ticket->replies()->create([
            'user_id' => auth()->id(),
            'message' => $request->message,
            'is_admin_reply' => true,
        ]);

        $ticket->update(['status' => 'in_progress']);

        return back()->with('success', 'Risposta inviata con successo.');
    }

    public function reviews()
    {
        $reviews = Review::with(['client', 'operator', 'consultation'])
            ->when(request('status'), function($query, $status) {
                return $query->where('status', $status);
            })
            ->latest()
            ->paginate(20);

        return view('admin.reviews', compact('reviews'));
    }

    public function updateReviewStatus(Review $review, Request $request)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        $review->update(['status' => $request->status]);

        if ($request->status === 'approved') {
            $review->operator->updateRating();
        }

        return back()->with('success', 'Stato della recensione aggiornato con successo.');
    }
}
