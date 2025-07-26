<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class OperatorMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check() || !auth()->user()->isOperator()) {
            abort(403, 'Accesso negato. Solo gli operatori possono accedere a questa sezione.');
        }

        if (auth()->user()->status !== 'active') {
            return redirect('/')->with('error', 'Il tuo account è in attesa di approvazione o è stato sospeso.');
        }

        return $next($request);
    }
}
