# syntax=docker/dockerfile:1
FROM php:8.2-cli

ENV COMPOSER_ALLOW_SUPERUSER=1

# SO y extensiones
RUN apt-get update && apt-get install -y git unzip rsync libpng-dev libonig-dev libxml2-dev libpq-dev && rm -rf /var/lib/apt/lists/*
RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql gd

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# 1) Crear Laravel base
RUN composer create-project laravel/laravel:^10.0 .

# 2) Fusionar tu backend sin borrar el core de Laravel
COPY . /overlay
RUN rsync -a /overlay/ /app/ && rm -rf /overlay

# 3) Instalar dependencias SIN scripts durante el build
RUN composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction --no-scripts || true
RUN composer dump-autoload -o --no-scripts || true

# 4) Sanity check: recrear Kernel.php SI FALTA (ahora con heredoc)
RUN if [ ! -f app/Console/Kernel.php ]; then \
  mkdir -p app/Console && cat > app/Console/Kernel.php <<'PHP'\n<?php
namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule): void
    {
        // Define your scheduled tasks here
    }

    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');
        require base_path('routes/console.php');
    }
}
PHP
; fi

# Entrypoint
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV PORT=10000
EXPOSE 10000

CMD ["/entrypoint.sh"]
