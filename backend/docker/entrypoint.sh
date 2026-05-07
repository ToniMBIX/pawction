#!/usr/bin/env bash
set -e

echo "PWD=$(pwd)"
echo "Listing /app:"
ls -la /app || true

cd /app

if [ ! -f artisan ]; then
  echo "ERROR: artisan no existe en /app"
  find / -name artisan 2>/dev/null | head -20
  exit 1
fi

php artisan config:clear || true
php artisan route:clear || true
php artisan cache:clear || true
php artisan view:clear || true
php artisan optimize:clear || true

php artisan config:cache || true
php artisan route:cache || true

echo "Starting web server on :${PORT:-10000} ..."
exec php artisan serve --host=0.0.0.0 --port=${PORT:-10000}