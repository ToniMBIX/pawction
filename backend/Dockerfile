# syntax=docker/dockerfile:1
FROM php:8.2-cli

# System deps
RUN apt-get update && apt-get install -y git unzip libpng-dev libonig-dev libxml2-dev libpq-dev && rm -rf /var/lib/apt/lists/*

# PHP extensions
RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql gd

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Create a fresh Laravel app
RUN composer create-project laravel/laravel:^10.0 .

# Overlay our backend (controllers, models, routes, etc.)
COPY . /app

# Install PHP packages we need
RUN composer require laravel/sanctum barryvdh/laravel-dompdf:^2.0 endroid/qr-code:^5.0 stripe/stripe-php:^12.0 --no-dev --prefer-dist --optimize-autoloader

# Entrypoint
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV PORT=10000
EXPOSE 10000

CMD ["/entrypoint.sh"]
