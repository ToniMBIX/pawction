<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;
use Illuminate\Http\Middleware\HandleCors;

class Kernel extends HttpKernel
{
    // Middleware global
    protected $middleware = [
        \Illuminate\Http\Middleware\HandleCors::class,
        \Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance::class,
        \Illuminate\Foundation\Http\Middleware\ValidatePostSize::class,
        \App\Http\Middleware\TrimStrings::class,
        \Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull::class,
    ];

    // Grupos
    protected $middlewareGroups = [
        'web' => [
            // (tu stack web por defecto)
        ],
        'api' => [
        \Illuminate\Http\Middleware\HandleCors::class,
        'throttle:api',
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],
    ];

    // ALIAS: añade si no lo tienes
    protected $middlewareAliases = [
        'auth'            => \App\Http\Middleware\Authenticate::class,
        'auth.basic'      => \Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,
        'cache.headers'   => \Illuminate\Http\Middleware\SetCacheHeaders::class,
        'can'             => \Illuminate\Auth\Middleware\Authorize::class,
        'guest'           => \App\Http\Middleware\RedirectIfAuthenticated::class,
        'password.confirm'=> \Illuminate\Auth\Middleware\RequirePassword::class,
        'precognitive'    => \Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests::class,
        'signed'          => \Illuminate\Routing\Middleware\ValidateSignature::class,
        'throttle'        => \Illuminate\Routing\Middleware\ThrottleRequests::class, // ← NECESARIO
        'verified'        => \Illuminate\Auth\Middleware\EnsureEmailIsVerified::class,
    ];
}
