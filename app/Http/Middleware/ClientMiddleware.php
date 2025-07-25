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
            if ($request->expectsJson()) {
                return response()->json(['error' => 'Accesso non autorizzato'], 403);
            }
            abort(403, 'Accesso non autorizzato.');
        }

        return $next($request);
    }
}
