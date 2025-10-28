# syntax=docker/dockerfile:1
FROM php:8.2-cli

# Instala dependencias del sistema
RUN apt-get update && apt-get install -y git unzip libpng-dev libonig-dev libxml2-dev libpq-dev && rm -rf /var/lib/apt/lists/*

# Extensiones PHP
RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql gd

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copia tu backend completo
COPY . /app

# Instala dependencias PHP (las del composer.json de tu repo)
RUN composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction --no-scripts

# Limpia cachés y dependencias sobrantes
RUN composer dump-autoload -o

# Entrypoint
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV PORT=10000
EXPOSE 10000

CMD ["/entrypoint.sh"]
