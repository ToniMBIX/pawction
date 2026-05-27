<?php

return [
    'stripe' => [
        'key' => env('STRIPE_KEY'),
        'secret' => env('STRIPE_SECRET'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
    ],
    'supabase' => [
    'url' => env('SUPABASE_URL'),
    'service_role_key' => env('SUPABASE_SERVICE_ROLE_KEY'),
    'storage_bucket' => env('SUPABASE_STORAGE_BUCKET', 'pawction'),
],
];