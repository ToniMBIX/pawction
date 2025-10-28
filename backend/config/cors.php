<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],

    // No fijes orígenes aquí…
    'allowed_origins' => [],

    // …usa patrones (tu frontend de Render + local)
    'allowed_origins_patterns' => [
        '#^https://pawction-frontend\.onrender\.com$#',
        '#^http://localhost(:\d+)?$#',
    ],

    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,

    // true está bien incluso si usas Bearer
    'supports_credentials' => true,
];
