#!/usr/bin/env bash
set -e

# Crear .env si no existe
if [ ! -f .env ]; then
  cp .env.example .env
fi

# Generar clave de app (ahora sí debe existir .env)
php artisan key:generate --force

# Limpiar y recachear config/rutas/vistas
php artisan config:clear
php artisan route:clear
php artisan cache:clear
php artisan view:clear
php artisan package:discover --ansi

# Migraciones (si falla, que se vea y se detenga)
echo "==> Running migrations..."
php -r "require 'vendor/autoload.php'; \$app=require 'bootstrap/app.php'; \$kernel=\$app->make(Illuminate\\Contracts\\Console\\Kernel::class); echo \"[DB] default='\".config('database.default').\"'\\n\";"; 
php -r "require 'vendor/autoload.php'; use Illuminate\\Support\\Facades\\DB; \$app=require 'bootstrap/app.php'; \$kernel=\$app->make(Illuminate\\Contracts\\Console\\Kernel::class); try{DB::connection()->getPdo(); echo \"[DB] connected OK\\n\";}catch(Throwable \$e){echo \"[DB] connect ERROR: \".\$e->getMessage().\"\\n\"; exit(1);} ";
php artisan migrate --force

# (resto de tu script)
php artisan config:cache
php artisan route:cache

echo "Starting web server on :${PORT:-10000} ..."
exec php artisan serve --host=0.0.0.0 --port=${PORT:-10000}

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
