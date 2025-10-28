# syntax=docker/dockerfile:1
FROM php:8.2-cli
ENV COMPOSER_ALLOW_SUPERUSER=1

RUN apt-get update && apt-get install -y git unzip libpng-dev libonig-dev libxml2-dev libpq-dev && rm -rf /var/lib/apt/lists/*
RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql gd
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# 1) Crear un Laravel 10 base (trae artisan y estructura correcta)
RUN composer create-project laravel/laravel:^10.0 .

# 2) Copiar tu backend SIN eliminar archivos core de Laravel
COPY . /app

# 3) Instalar dependencias sin scripts en build
RUN composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction --no-scripts || true
RUN composer dump-autoload -o --no-scripts || true

# Entrypoint
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV PORT=10000
EXPOSE 10000
CMD ["/entrypoint.sh"]
