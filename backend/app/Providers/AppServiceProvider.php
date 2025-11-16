<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        
        // Forzar HTTPS en producción (Render usa HTTPS)
        if (app()->environment('production')) {
            URL::forceScheme('https');
        }

        // Crear el symlink public/storage -> storage/app/public si no existe
        $publicStorage = public_path('storage');
        $storagePath   = storage_path('app/public');

        if (!is_link($publicStorage) && is_dir($storagePath)) {
            @symlink($storagePath, $publicStorage);
        }
    }
}
