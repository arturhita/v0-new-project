<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Consultation;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
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

        return view('client.dashboard', compact('stats', 'recentConsultations'));
    }

    public function consultations()
    {
        $consultations = auth()->user()->clientConsultations()
            ->with(['operator', 'review'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return view('client.consultations', compact('consultations'));
    }

    public function operators()
    {
        $operators = User::operators()
            ->available()
            ->with('operatorReviews')
            ->paginate(12);

        return view('client.operators', compact('operators'));
    }
}
