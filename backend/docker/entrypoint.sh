#!/usr/bin/env bash
set -e

mkdir -p /app/storage/framework/{cache,sessions,views} /app/storage/app/{qr,pdfs}
php -r "file_exists('.env') || copy('.env.example', '.env');"

# Clave + limpieza de cachés
php artisan key:generate --force
php artisan config:clear
php artisan route:clear
php artisan cache:clear
php artisan view:clear
php artisan package:discover --ansi

# Publicar vendors (si tus providers lo necesitan)
php artisan vendor:publish --provider="Barryvdh\DomPDF\ServiceProvider" --force || true
php artisan vendor:publish --tag="sanctum-migrations" --force || true
php artisan queue:table || true

# ⚠️ AHORA migramos y si falla, detenemos el arranque
echo "==> Running migrations..."
php artisan migrate --force

# Seeds necesarios (admin, etc.)
php artisan db:seed --class=Database\\Seeders\\AdminUserSeeder --force || true

# Cache de prod
php artisan config:cache
php artisan route:cache

echo "Starting web server on :${PORT:-10000} ..."
exec php artisan serve --host=0.0.0.0 --port=${PORT:-10000}
