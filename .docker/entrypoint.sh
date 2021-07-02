#!/bin/bash

#On error no such file entrypoint.sh, execute in terminal - dos2unix .docker\entrypoint.sh

# FRONT-END
cd /var/www/frontend && npm install && cd ..

# BACK-END
cd backend
chown -R www-data:www-data .
composer install
php artisan key:generate
php artisan migrate

php-fpm
