<?php

return [

    // Aplica CORS también a cualquier ruta (incluye 404/500 y redirecciones)
    'paths' => ['api/*', '*'],

    'allowed_methods' => ['*'],

    // Pon tu frontend explícito
    'allowed_origins' => [env('FRONTEND_URL', 'https://pawction-frontend.onrender.com')],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // SIN cookies; estamos usando Bearer tokens
    'supports_credentials' => false,
];
