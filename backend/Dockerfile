# syntax=docker/dockerfile:1
FROM php:8.2-cli

# System deps
RUN apt-get update && apt-get install -y git unzip libpng-dev libonig-dev libxml2-dev libpq-dev && rm -rf /var/lib/apt/lists/*

# PHP extensions
RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql gd

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . /app

# Install PHP deps
RUN composer install --no-dev --prefer-dist --optimize-autoloader

# Entrypoint
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV PORT=10000
ENV WORKER=0
EXPOSE 10000

CMD ["/entrypoint.sh"]
