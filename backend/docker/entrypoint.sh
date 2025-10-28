#!/usr/bin/env bash
set -e

# Preparar almacenamiento y .env
mkdir -p /app/storage/framework/{cache,sessions,views} /app/storage/app/{qr,pdfs}
php -r "file_exists('.env') || copy('.env.example', '.env');" || true

# Clave y limpieza de cachés
php artisan key:generate --force || true
php artisan config:clear || true
php artisan route:clear || true
php artisan cache:clear || true
php artisan package:discover --ansi || true

# Publicaciones y migraciones
php artisan vendor:publish --provider="Barryvdh\DomPDF\ServiceProvider" --force || true
php artisan vendor:publish --tag="sanctum-migrations" --force || true
php artisan queue:table || true
php artisan migrate --force || true
php artisan db:seed --class=Database\\Seeders\\AdminUserSeeder --force || true

# Re-cachear para prod
php artisan config:cache || true
php artisan route:cache || true

echo "Starting web server on :${PORT:-10000} ..."
exec php artisan serve --host=0.0.0.0 --port=${PORT:-10000}
