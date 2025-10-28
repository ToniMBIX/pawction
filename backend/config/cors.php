return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],

    // Vacío aquí…
    'allowed_origins' => [],

    // …y usa patrones. Opción estricta (sólo tu frontend de Render + local):
    'allowed_origins_patterns' => [
        '#^https://pawction-frontend\.onrender\.com$#',
        '#^http://localhost:5173$#',
    ],

    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,

    // Puedes dejarlo en true (aunque uses Bearer tokens, no molesta)
    'supports_credentials' => true,
];
