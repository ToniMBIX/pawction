# syntax=docker/dockerfile:1
FROM php:8.2-cli

RUN apt-get update && apt-get install -y git unzip libpng-dev libonig-dev libxml2-dev libpq-dev && rm -rf /var/lib/apt/lists/*
RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql gd

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# 1) Crea un Laravel limpio
RUN composer create-project laravel/laravel:^10.0 .

# 2) Añade paquetes necesarios SIN scripts (evita package:discover en build)
RUN composer require \
    laravel/sanctum \
    barryvdh/laravel-dompdf:^2.0 \
    endroid/qr-code:^5.0 \
    stripe/stripe-php:^12.0 \
    --prefer-dist -o --no-interaction --no-scripts \
 && composer dump-autoload -o

# 3) Superpone tu código del backend (controladores, rutas, config, etc.)
COPY . /app

# Entrypoint (hará package:discover, vendor:publish, migrate, etc.)
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV PORT=10000
EXPOSE 10000
CMD ["/entrypoint.sh"]

