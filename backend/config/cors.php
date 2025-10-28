return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],

    'allowed_origins' => [],
    'allowed_origins_patterns' => [
        '#^https://pawction-frontend\.onrender\.com$#',
        '#^http://localhost(:[0-9]+)?$#',
    ],

    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
