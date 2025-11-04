# # -------- Stage 1: Build frontend (Node) --------
# FROM node:20-alpine AS node-build
# WORKDIR /app

# # Copy dependency files dan install
# COPY package*.json ./
# RUN npm ci --silent || npm install --silent

# # Copy semua file sumber dan build asset frontend
# COPY . .
# RUN npm run build || echo "Skipping frontend build (no build script found)"

# # -------- Stage 2: Install PHP dependencies (Composer) --------
# FROM php:8.2-apache AS php-base

# # Install dependency system dan ekstensi PHP
# RUN apt-get update && apt-get install -y --no-install-recommends \
#     git curl zip unzip libpng-dev libonig-dev libxml2-dev libzip-dev libicu-dev \
#   && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip intl xml \
#   && apt-get clean && rm -rf /var/lib/apt/lists/*

# # Copy Composer binary dari official image
# COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# WORKDIR /var/www/html

# # Copy composer files (buat caching Docker)
# COPY composer.json composer.lock* ./

# # Environment variable buat Composer
# ENV COMPOSER_ALLOW_SUPERUSER=1 \
#     COMPOSER_MEMORY_LIMIT=-1

# # Jalankan composer install dengan log verbose + retry
# RUN mkdir -p /tmp/composer-cache && \
#     COMPOSER_CACHE_DIR=/tmp/composer-cache composer diagnose || true && \
#     COMPOSER_CACHE_DIR=/tmp/composer-cache composer install --no-dev --optimize-autoloader --prefer-dist --no-interaction --no-progress --verbose 2>&1 | tee /tmp/composer-install.log || (cat /tmp/composer-install.log && false)

# # -------- Stage 3: Final image --------
# FROM php:8.2-apache

# # Install ekstensi PHP runtime
# RUN apt-get update && apt-get install -y --no-install-recommends \
#     libpng-dev libonig-dev libxml2-dev libzip-dev zip unzip libicu-dev \
#   && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip intl xml \
#   && apt-get clean && rm -rf /var/lib/apt/lists/*

# # Copy Composer
# COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# WORKDIR /var/www/html

# # Copy seluruh file aplikasi
# COPY . .

# # Copy vendor dari php-base
# COPY --from=php-base /var/www/html/vendor ./vendor

# # Copy hasil build frontend dari stage node
# COPY --from=node-build /app/public/build ./public/build

# # Konfigurasi Apache supaya serve dari folder public
# RUN a2enmod rewrite && \
#     sed -i 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/000-default.conf && \
#     sed -i 's/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf && \
#     echo "ServerName localhost" >> /etc/apache2/apache2.conf

# # Fix permission untuk Laravel
# RUN mkdir -p /var/www/html/storage /var/www/html/bootstrap/cache && \
#     chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache && \
#     chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# # Jalankan cache artisan (non-fatal kalau belum ada .env)
# RUN php artisan config:cache || true && \
#     php artisan route:cache || true && \
#     php artisan view:cache || true

# EXPOSE 80
# CMD ["apache2-foreground"]


# -------- Stage 1: Build frontend (Node) --------
FROM node:20-alpine AS node-build
WORKDIR /app
COPY package*.json ./
RUN npm ci --silent || npm install --silent
COPY . .
RUN npm run build || echo "Skipping frontend build"

# -------- Stage 2: Install PHP dependencies (Composer) --------
FROM php:8.2-apache AS php-base

# Install system deps & PHP extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    git curl ca-certificates zip unzip libpng-dev libonig-dev libxml2-dev libzip-dev libicu-dev \
  && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip intl xml \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

# Install Composer manually (curl installer)
RUN curl -sS https://getcomposer.org/installer -o /tmp/composer-setup.php \
 && php /tmp/composer-setup.php --install-dir=/usr/local/bin --filename=composer \
 && rm /tmp/composer-setup.php \
 && composer --version

# Copy composer files and install deps
COPY composer.json composer.lock* ./
ENV COMPOSER_ALLOW_SUPERUSER=1 \
    COMPOSER_MEMORY_LIMIT=-1
RUN mkdir -p /tmp/composer-cache && \
    COMPOSER_CACHE_DIR=/tmp/composer-cache composer diagnose || true && \
    COMPOSER_CACHE_DIR=/tmp/composer-cache composer install --no-dev --optimize-autoloader --prefer-dist --no-interaction --no-progress --verbose 2>&1 | tee /tmp/composer-install.log || (cat /tmp/composer-install.log && false)

# -------- Stage 3: Final image --------
FROM php:8.2-apache
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpng-dev libonig-dev libxml2-dev libzip-dev zip unzip libicu-dev \
  && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip intl xml \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install composer in final image too (optional, handy)
RUN curl -sS https://getcomposer.org/installer -o /tmp/composer-setup.php \
 && php /tmp/composer-setup.php --install-dir=/usr/local/bin --filename=composer \
 && rm /tmp/composer-setup.php \
 && composer --version

WORKDIR /var/www/html
COPY . .
COPY --from=php-base /var/www/html/vendor ./vendor
COPY --from=node-build /app/public/build ./public/build

# Apache config + perms
RUN a2enmod rewrite && \
    sed -i 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/000-default.conf && \
    sed -i 's/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf && \
    echo "ServerName localhost" >> /etc/apache2/apache2.conf

RUN mkdir -p /var/www/html/storage /var/www/html/bootstrap/cache && \
    chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache && \
    chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

RUN php artisan config:cache || true && php artisan route:cache || true && php artisan view:cache || true

EXPOSE 80
CMD ["apache2-foreground"]
