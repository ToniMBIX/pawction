<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Filesystem Disk
    |--------------------------------------------------------------------------
    |
    | Aquí defines el disco que Laravel usará por defecto. Puede ser "local",
    | "public", "s3", etc.
    |
    */

    'default' => env('FILESYSTEM_DISK', 'public'),

    /*
    |--------------------------------------------------------------------------
    | Filesystem Disks
    |--------------------------------------------------------------------------
    |
    | Aquí defines los discos disponibles. Puedes añadir tantos como quieras.
    |
    */

    'disks' => [

        // Disk interno (no accesible públicamente)
        'local' => [
            'driver' => 'local',
            'root' => storage_path('app'),
        ],

        // ⚠️ ESTE ES EL IMPORTANTE para tus IMÁGENES
        'public' => [
            'driver' => 'local',
            'root'   => storage_path('app/public'),              // donde se guarda el archivo físico
            'url'    => env('APP_URL') . '/storage',             // URL pública "/storage/..."
            'visibility' => 'public',
            'throw' => false,
        ],

        // Ejemplo S3, por si algún día lo usas
        's3' => [
            'driver' => 's3',
            'key'    => env('AWS_ACCESS_KEY_ID'),
            'secret' => env('AWS_SECRET_ACCESS_KEY'),
            'region' => env('AWS_DEFAULT_REGION'),
            'bucket' => env('AWS_BUCKET'),
            'url'    => env('AWS_URL'),
            'visibility' => 'private',
            'throw' => false,
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Symbolic Links
    |--------------------------------------------------------------------------
    |
    | Aquí definimos qué enlaces simbólicos creará `php artisan storage:link`
    |
    */

    'links' => [
        public_path('storage') => storage_path('app/public'),
    ],

];
