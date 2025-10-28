#!/usr/bin/env bash
set -e

# Preparar storage y .env
mkdir -p /app/storage/framework/{cache,sessions,views} /app/storage/app/{qr,pdfs}
php -r "file_exists('.env') || copy('.env.example', '.env');" || true

echo "[DIAG] ls app/Console:" && ls -la app/Console || true
php -r "echo \"[DIAG] has App\\\\Console\\\\Kernel: \".(file_exists('app/Console/Kernel.php')?'yes':'no').\"\\n\";"
php -r "require 'vendor/autoload.php'; echo \"[DIAG] class_exists App\\\\Console\\\\Kernel: \".(class_exists('App\\\\Console\\\\Kernel')?'yes':'no').\"\\n\";"
php -r "echo \"[DIAG] bootstrap/app.php first line: \".trim(explode(\"\\n\", file_get_contents('bootstrap/app.php'))[0]).\"\\n\";"

# Clave y limpieza
php artisan key:generate --force || true
php artisan config:clear || true
php artisan route:clear || true
php artisan cache:clear || true

# Descubrir paquetes AHORA (ya con .env)
php artisan package:discover --ansi || true

# Publicaciones y migraciones
php artisan vendor:publish --provider="Barryvdh\DomPDF\ServiceProvider" --force || true
php artisan vendor:publish --tag="sanctum-migrations" --force || true
php artisan queue:table || true
php artisan migrate --force || true
php artisan db:seed --class=Database\\Seeders\\AdminUserSeeder --force || true

# Re-cache para prod
php artisan config:cache || true
php artisan route:cache || true

echo "Starting web server on :${PORT:-10000} ..."
exec php artisan serve --host=0.0.0.0 --port=${PORT:-10000}
