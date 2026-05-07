#!/usr/bin/env bash
set -e

cd /app

php artisan config:clear || true
php artisan route:clear || true
php artisan cache:clear || true
php artisan view:clear || true
php artisan optimize:clear || true

php artisan config:cache || true
php artisan route:cache || true

echo "Starting web server on :${PORT:-10000} ..."
exec php artisan serve --host=0.0.0.0 --port=${PORT:-10000}