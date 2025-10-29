#!/usr/bin/env bash
set -e

# 0) .env siempre presente + APP_KEY vacío si faltara
if [ ! -f .env ]; then
  cp .env.example .env
fi
grep -q "^APP_KEY=" .env || echo "APP_KEY=" >> .env

# 1) Generar clave (necesita .env con APP_KEY=)
php artisan key:generate --force

# 2) Limpieza de cachés/config
php artisan config:clear
php artisan route:clear
php artisan cache:clear
php artisan view:clear
php artisan package:discover --ansi

php artisan migrate --force

php artisan config:cache
php artisan route:cache


# 3) (Diagnóstico seguro) — booteamos el kernel ANTES de usar config()
php -r "
require 'vendor/autoload.php';
\$app = require 'bootstrap/app.php';
\$kernel = \$app->make(Illuminate\Contracts\Console\Kernel::class);
\$kernel->bootstrap();
echo \"[DB] default='\".\$app['config']->get('database.default').\"'\\n\";
" 

php -r "
require 'vendor/autoload.php';
\$app = require 'bootstrap/app.php';
\$kernel = \$app->make(Illuminate\Contracts\Console\Kernel::class);
\$kernel->bootstrap();
use Illuminate\Support\Facades\DB;
try { DB::connection()->getPdo(); echo \"[DB] connected OK\\n\"; }
catch (Throwable \$e) { echo \"[DB] connect ERROR: \".\$e->getMessage().\"\\n\"; exit(1); }
"

# 4) Vendors opcionales
php artisan vendor:publish --provider="Barryvdh\DomPDF\ServiceProvider" --force || true
php artisan vendor:publish --tag="sanctum-migrations" --force || true
# Solo crear tabla de jobs si no existe migración previa
if ! php artisan migrate:status | grep -q 'jobs'; then
  echo "Jobs table not found, skipping queue:table (already exists)"
fi

# 5) Migraciones (si falla, detenemos – verás el motivo en logs)
echo "==> Running migrations..."
php artisan migrate --force

# 6) Seeds opcionales
php artisan db:seed --class=Database\\Seeders\\AdminUserSeeder --force || true

# 7) Cache de prod
php artisan config:cache
php artisan route:cache

echo "Starting web server on :${PORT:-10000} ..."
exec php artisan serve --host=0.0.0.0 --port=${PORT:-10000}
