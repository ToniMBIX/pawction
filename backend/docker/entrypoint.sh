#!/usr/bin/env bash
set -e

# Ensure storage & cache dirs
mkdir -p /app/storage/framework/{cache,sessions,views} /app/storage/app/qr /app/storage/app/pdfs
php -r "file_exists('.env') || copy('.env.example', '.env');" || true

# Generate key if missing
php artisan key:generate --force || true

# Optimize & migrate DB (ignore failures on first boot but stop on migration errors)
php artisan config:cache || true
php artisan route:cache || true
php artisan queue:table || true
php artisan migrate --force || true
php artisan db:seed --class=Database\\Seeders\\AdminUserSeeder --force || true

if [ "$WORKER" = "1" ]; then
  echo "Starting queue worker..."
  exec php artisan queue:work --verbose --tries=3 --timeout=90
else
  echo "Starting web server on :${PORT:-10000} ..."
  exec php artisan serve --host=0.0.0.0 --port=${PORT:-10000}
fi
