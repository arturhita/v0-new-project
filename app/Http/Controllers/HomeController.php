<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Review;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index()
    {
        // Ottieni gli operatori più votati
        $topOperators = User::where('role', 'operator')
            ->where('status', 'approved')
            ->where('is_available', true)
            ->withAvg('receivedReviews', 'rating')
            ->withCount('receivedReviews')
            ->orderBy('received_reviews_avg_rating', 'desc')
            ->take(6)
            ->get();

        // Ottieni le ultime recensioni
        $latestReviews = Review::with(['client', 'operator'])
            ->where('status', 'approved')
            ->latest()
            ->take(3)
            ->get();

        // Statistiche della piattaforma
        $stats = [
            'total_operators' => User::where('role', 'operator')->where('status', 'approved')->count(),
            'total_consultations' => \App\Models\Consultation::where('status', 'completed')->count(),
            'average_rating' => Review::where('status', 'approved')->avg('rating') ?? 0,
            'total_clients' => User::where('role', 'client')->count(),
        ];

        return view('welcome', compact('topOperators', 'latestReviews', 'stats'));
    }
}
