<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class OperatorMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!auth()->check() || !auth()->user()->isOperator()) {
            abort(403, 'Accesso negato. Solo gli operatori possono accedere a questa sezione.');
        }

        return $next($request);
    }
}
