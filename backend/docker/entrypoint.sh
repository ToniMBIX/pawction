#!/usr/bin/env bash
set -e

php artisan config:clear
php artisan route:clear
php artisan cache:clear
php artisan view:clear
php artisan optimize:clear

php artisan config:cache
php artisan route:cache

echo "Starting web server on :${PORT:-10000} ..."
exec php artisan serve --host=0.0.0.0 --port=${PORT:-10000}