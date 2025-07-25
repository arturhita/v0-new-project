<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Consultation;
use App\Models\PayoutRequest;
use App\Models\Ticket;
use Illuminate\Http\Request;

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
        ];

        return view('admin.dashboard', compact('stats'));
    }

    public function users()
    {
        $users = User::with(['clientConsultations', 'operatorConsultations'])
            ->paginate(20);

        return view('admin.users', compact('users'));
    }

    public function suspendUser(Request $request, User $user)
    {
        $user->update(['is_suspended' => !$user->is_suspended]);

        $status = $user->is_suspended ? 'sospeso' : 'riattivato';
        
        return back()->with('success', "Utente {$status} con successo.");
    }

    public function payouts()
    {
        $payouts = PayoutRequest::with('operator')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return view('admin.payouts', compact('payouts'));
    }

    public function updatePayoutStatus(Request $request, PayoutRequest $payout)
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

    public function replyToTicket(Request $request, Ticket $ticket)
    {
        $request->validate([
            'message' => 'required|string',
        ]);

        $ticket->replies()->create([
            'user_id' => auth()->id(),
            'message' => $request->message,
            'is_admin_reply' => true,
        ]);

        // Update ticket status if needed
        if ($request->has('close_ticket')) {
            $ticket->update(['status' => 'resolved']);
        }

        return back()->with('success', 'Risposta inviata con successo.');
    }
}
