<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Review;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index()
    {
        $featuredOperators = User::operators()
            ->available()
            ->with(['operatorReviews' => function($query) {
                $query->where('status', 'approved');
            }])
            ->limit(6)
            ->get();

        $recentReviews = Review::where('status', 'approved')
            ->with(['client', 'operator'])
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get();

        $stats = [
            'total_operators' => User::operators()->count(),
            'total_consultations' => \App\Models\Consultation::where('status', 'completed')->count(),
            'average_rating' => Review::where('status', 'approved')->avg('rating') ?? 0,
        ];

        return view('welcome', compact('featuredOperators', 'recentReviews', 'stats'));
    }
}
