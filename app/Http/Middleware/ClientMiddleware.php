<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ClientMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check() || !auth()->user()->isClient()) {
            abort(403, 'Accesso negato. Solo i clienti possono accedere a questa sezione.');
        }

        return $next($request);
    }
}
