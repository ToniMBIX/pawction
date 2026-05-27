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
'supabase_storage' => [
    'url' => env('PAWCTION_STORAGE_URL', env('SUPABASE_URL')),
    'key' => env('PAWCTION_STORAGE_KEY', env('SUPABASE_SERVICE_ROLE_KEY')),
    'bucket' => env('PAWCTION_STORAGE_BUCKET', env('SUPABASE_STORAGE_BUCKET', 'pawction')),
],
];