<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ForceJsonResponse
{
    public function handle(Request $request, Closure $next)
    {
        // Asegura que Laravel trate la petición como API/JSON
        $request->headers->set('Accept', 'application/json');
        return $next($request);
    }
}
