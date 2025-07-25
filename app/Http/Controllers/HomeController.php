<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Consultation;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index()
    {
        $operators = User::where('role', 'operator')
            ->where('is_approved', true)
            ->where('is_suspended', false)
            ->where('is_online', true)
            ->withCount('reviews')
            ->orderBy('rating', 'desc')
            ->take(8)
            ->get();

        $stats = [
            'total_operators' => User::where('role', 'operator')->where('is_approved', true)->count(),
            'total_consultations' => Consultation::where('status', 'completed')->count(),
            'online_operators' => User::where('role', 'operator')->where('is_online', true)->count(),
        ];

        return view('welcome', compact('operators', 'stats'));
    }
}
