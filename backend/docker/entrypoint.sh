#!/usr/bin/env bash
set -e

cd /app

echo "APP_KEY=${APP_KEY:0:12}..."
echo "DB_HOST=$DB_HOST"
echo "DB_DATABASE=$DB_DATABASE"
echo "DB_USERNAME=$DB_USERNAME"

php artisan --version

echo "Starting web server on :${PORT:-10000} ..."
exec php artisan serve --host=0.0.0.0 --port=${PORT:-10000} -vvv