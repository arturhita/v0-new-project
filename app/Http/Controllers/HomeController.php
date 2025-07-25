<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Review;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index()
    {
        $featuredOperators = User::where('role', 'operator')
            ->where('status', 'active')
            ->where('is_online', true)
            ->withCount(['reviews' => function ($query) {
                $query->where('status', 'approved');
            }])
            ->with(['reviews' => function ($query) {
                $query->where('status', 'approved')->latest()->limit(3);
            }])
            ->orderBy('reviews_count', 'desc')
            ->limit(8)
            ->get();

        $recentReviews = Review::where('status', 'approved')
            ->with(['client', 'operator'])
            ->latest()
            ->limit(6)
            ->get();

        $stats = [
            'total_operators' => User::where('role', 'operator')->where('status', 'active')->count(),
            'total_consultations' => \App\Models\Consultation::where('status', 'completed')->count(),
            'average_rating' => Review::where('status', 'approved')->avg('rating') ?? 0,
            'online_operators' => User::where('role', 'operator')->where('is_online', true)->count(),
        ];

        return view('welcome', compact('featuredOperators', 'recentReviews', 'stats'));
    }
}
