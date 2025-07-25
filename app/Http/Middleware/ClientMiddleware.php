<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ClientMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!auth()->check() || !auth()->user()->isClient()) {
            abort(403, 'Accesso negato. Solo i clienti possono accedere a questa sezione.');
        }

        return $next($request);
    }
}
