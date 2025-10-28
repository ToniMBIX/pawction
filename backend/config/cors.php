<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],

    // Deja 'allowed_origins' vacío y usa patrones:
    'allowed_origins' => [],
    'allowed_origins_patterns' => [
        '#^https://pawction-frontend\.onrender\.com$#',
        '#^http://localhost(:[0-9]+)?$#',
    ],

    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,

    // Aunque uses Bearer tokens, dejarlo en true no molesta
    'supports_credentials' => true,
];
