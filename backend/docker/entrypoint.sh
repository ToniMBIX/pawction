#!/usr/bin/env bash
set -e

# If vendor missing, assume fresh container (first run)
if [ ! -d /app/vendor ]; then
  echo "Vendor not found; installing dependencies..."
  composer install --no-dev --prefer-dist --optimize-autoloader || true
fi

# Ensure storage dirs
mkdir -p /app/storage/framework/{cache,sessions,views} /app/storage/app/qr /app/storage/app/pdfs
php -r "file_exists('.env') || copy('.env.example', '.env');" || true

# Generate APP_KEY if missing
php artisan key:generate --force || true

# Publish vendor assets (DomPDF, Sanctum)
php artisan vendor:publish --provider="Barryvdh\DomPDF\ServiceProvider" --force || true
php artisan vendor:publish --tag="sanctum-migrations" --force || true

# Ensure queue table exists (safe to ignore if already there)
php artisan queue:table || true

# Run migrations & seed admin (safe repeats)
php artisan migrate --force || true
php artisan db:seed --class=Database\\Seeders\\AdminUserSeeder --force || true

# Inject AdminServiceProvider into config/app.php if missing
php -r '
$p = "config/app.php";
$c = file_get_contents($p);
if (strpos($c, "App\\\\Providers\\\\AdminServiceProvider::class") === false) {
  $c = preg_replace(
    "/Providers\\\\\\\\RouteServiceProvider::class,\\s*\\],/",
    "Providers\\\\RouteServiceProvider::class,\n        App\\\\Providers\\\\AdminServiceProvider::class,\n    ],",
    $c
  );
  file_put_contents($p, $c);
}
' || true

# Optimize caches
php artisan config:cache || true
php artisan route:cache || true

echo "Starting web server on :${PORT:-10000} ..."
exec php artisan serve --host=0.0.0.0 --port=${PORT:-10000}
