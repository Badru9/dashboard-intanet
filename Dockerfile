# # -------- Stage 1: Build frontend (Node) --------
# FROM node:20-alpine AS node-build
# WORKDIR /app

# # Copy only package files for caching
# COPY package.json package-lock.json* pnpm-lock.yaml* ./
# # Use npm ci when lockfile present (faster & deterministic)
# RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# # Copy frontend source and build assets (assumes assets are in resources/js or similar)
# COPY resources resources
# COPY vite.config.* ./
# COPY tailwind.config.* ./
# RUN npm run build

# # -------- Stage 2: Install PHP dependencies (Composer) --------
# FROM php:8.2-apache AS php-base

# # System deps for Laravel + ext installs
# RUN apt-get update && apt-get install -y --no-install-recommends \
#     git curl ca-certificates zip unzip libpng-dev libonig-dev libxml2-dev libzip-dev \
#   && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip \
#   && apt-get clean && rm -rf /var/lib/apt/lists/*

# # Copy composer binary from official composer image
# COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# WORKDIR /var/www/html

# # Copy composer files first (to leverage Docker cache)
# COPY composer.json composer.lock* ./ 

# # Install composer deps (production)
# RUN composer install --no-dev --optimize-autoloader --prefer-dist --no-interaction --no-progress

# # -------- Stage 3: Final image --------
# FROM php:8.2-apache

# # Reinstall the same PHP extensions in final image
# RUN apt-get update && apt-get install -y --no-install-recommends \
#     libpng-dev libonig-dev libxml2-dev libzip-dev zip unzip \
#   && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip \
#   && apt-get clean && rm -rf /var/lib/apt/lists/*

# # Bring composer into final image (optional but handy for runtime artisan tasks)
# COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# # Set working dir and copy app
# WORKDIR /var/www/html
# COPY . .

# # Copy composer vendor from previous composer-install stage to avoid reinstalling
# COPY --from=php-base /var/www/html/vendor ./vendor
# COPY --from=php-base /var/www/html/vendor/bin ./vendor/bin

# # Copy built frontend assets from node stage into the correct public assets location
# # Adjust paths if your build outputs elsewhere (e.g., public/build, public/assets, public/js)
# COPY --from=node-build /app/public/build ./public/build

# # Apache: set documentroot to public and enable rewrite
# RUN a2enmod rewrite \
#   && sed -i 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/000-default.conf \
#   && sed -i 's/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf \
#   && echo "ServerName localhost" >> /etc/apache2/apache2.conf

# # Permissions (adjust user/group if needed)
# RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
#   && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# RUN php artisan config:cache || true \
#   && php artisan route:cache || true \
#   && php artisan view:cache || true

# EXPOSE 80
# CMD ["apache2-foreground"]

# -------- Stage 1: Build frontend (Node) --------
FROM node:20-alpine AS node-build
WORKDIR /app

# Copy dependency files and install
COPY package*.json ./
RUN npm ci --silent || npm install --silent

# Copy source files and build
COPY . .
RUN npm run build || echo "Skipping frontend build (no build script found)"

# -------- Stage 2: Install PHP dependencies (Composer) --------
FROM php:8.2-apache AS php-base

# Install system dependencies and PHP extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    git curl zip unzip libpng-dev libonig-dev libxml2-dev libzip-dev \
  && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# Add Composer from official image
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy composer files first for better caching
COPY composer.json composer.lock* ./

# Install PHP dependencies (with fallback for network issues)
RUN mkdir -p /tmp/composer-cache && \
    COMPOSER_CACHE_DIR=/tmp/composer-cache composer install --no-dev --optimize-autoloader --prefer-dist --no-interaction --no-progress || \
    (echo 'Composer install failed — retrying without cache' && composer install --no-dev --optimize-autoloader --prefer-dist --no-interaction)

# -------- Stage 3: Final image --------
FROM php:8.2-apache

# Install required PHP extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpng-dev libonig-dev libxml2-dev libzip-dev zip unzip \
  && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy Composer binary
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy app files
COPY . .

# Copy vendor dependencies from php-base stage
COPY --from=php-base /var/www/html/vendor ./vendor

# Copy built frontend assets from node stage
COPY --from=node-build /app/public/build ./public/build

# Configure Apache to use Laravel public directory
RUN a2enmod rewrite && \
    sed -i 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/000-default.conf && \
    sed -i 's/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf && \
    echo "ServerName localhost" >> /etc/apache2/apache2.conf

# Fix permissions for storage and cache
RUN mkdir -p /var/www/html/storage /var/www/html/bootstrap/cache && \
    chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache && \
    chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Optimize Laravel caches (won’t fail build if artisan not available yet)
RUN php artisan config:cache || true && \
    php artisan route:cache || true && \
    php artisan view:cache || true

EXPOSE 80
CMD ["apache2-foreground"]
