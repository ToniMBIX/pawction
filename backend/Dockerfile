# syntax=docker/dockerfile:1
FROM php:8.2-cli

ENV COMPOSER_ALLOW_SUPERUSER=1

# Sistema y extensiones
RUN apt-get update && apt-get install -y git unzip libpng-dev libonig-dev libxml2-dev libpq-dev && rm -rf /var/lib/apt/lists/*
RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql gd

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# 1) Crea un Laravel base dentro de la imagen (así existen artisan, config, etc.)
RUN composer create-project laravel/laravel:^10.0 .

# 2) Superpone TU backend (controllers, routes, config, views, etc.)
#    IMPORTANTE: esta copia NO debe borrar vendor. Copia solo tu código.
COPY . /app

# 3) Añade dependencias necesarias SIN scripts de composer
#    (evita package:discover durante el build)
RUN composer require \
    laravel/sanctum \
    barryvdh/laravel-dompdf:^2.0 \
    endroid/qr-code:^5.0 \
    stripe/stripe-php:^12.0 \
    --prefer-dist -o --no-interaction --no-scripts \
 && composer dump-autoload -o --no-scripts

# Entrypoint
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV PORT=10000
EXPOSE 10000

CMD ["/entrypoint.sh"]
