# syntax=docker/dockerfile:1
FROM php:8.2-cli

RUN apt-get update && apt-get install -y git unzip libpng-dev libonig-dev libxml2-dev libpq-dev && rm -rf /var/lib/apt/lists/*
RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql gd

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copia todo el backend (composer.json incluido)
COPY . /app

# Instala dependencias PHP
RUN if [ -f "composer.json" ]; then composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction --no-scripts; else echo "composer.json not found!"; exit 1; fi

RUN composer dump-autoload -o

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV PORT=10000
EXPOSE 10000

CMD ["/entrypoint.sh"]

