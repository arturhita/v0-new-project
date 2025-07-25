<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Consultation;
use App\Models\Review;
use App\Models\Ticket;
use App\Models\PayoutRequest;
use App\Models\TicketReply;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function dashboard()
    {
        $stats = [
            'total_users' => User::count(),
            'total_operators' => User::where('role', 'operator')->count(),
            'total_clients' => User::where('role', 'client')->count(),
            'pending_operators' => User::where('role', 'operator')->where('status', 'pending')->count(),
            'total_consultations' => Consultation::count(),
            'active_consultations' => Consultation::where('status', 'active')->count(),
            'completed_consultations' => Consultation::where('status', 'completed')->count(),
            'total_revenue' => Consultation::where('status', 'completed')->sum('total_cost'),
            'pending_reviews' => Review::where('status', 'pending')->count(),
            'open_tickets' => Ticket::where('status', 'open')->count(),
            'pending_payouts' => PayoutRequest::where('status', 'pending')->count(),
        ];

        $recentConsultations = Consultation::with(['client', 'operator'])
            ->latest()
            ->limit(10)
            ->get();

        $recentUsers = User::latest()->limit(10)->get();

        return view('admin.dashboard', compact('stats', 'recentConsultations', 'recentUsers'));
    }

    public function users()
    {
        $users = User::with(['consultationsAsClient', 'consultationsAsOperator', 'reviews'])
            ->paginate(20);

        return view('admin.users', compact('users'));
    }

    public function suspendUser(User $user)
    {
        $user->update(['status' => $user->status === 'suspended' ? 'active' : 'suspended']);

        return back()->with('success', 'Stato utente aggiornato con successo.');
    }

    public function approveOperator(User $user)
    {
        if ($user->role === 'operator' && $user->status === 'pending') {
            $user->update(['status' => 'active']);
            return back()->with('success', 'Operatore approvato con successo.');
        }

        return back()->with('error', 'Impossibile approvare questo utente.');
    }

    public function deleteUser(User $user)
    {
        if ($user->role === 'admin') {
            return back()->with('error', 'Impossibile eliminare un amministratore.');
        }

        $user->delete();
        return back()->with('success', 'Utente eliminato con successo.');
    }

    public function payouts()
    {
        $payouts = PayoutRequest::with('operator')
            ->orderBy('created_at', 'desc')
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
        $tickets = Ticket::with(['user', 'replies'])
            ->orderBy('created_at', 'desc')
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

        TicketReply::create([
            'ticket_id' => $ticket->id,
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
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return view('admin.reviews', compact('reviews'));
    }

    public function updateReviewStatus(Review $review, Request $request)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        $review->update(['status' => $request->status]);

        return back()->with('success', 'Stato della recensione aggiornato con successo.');
    }
}
