#!/bin/sh

# Replace BACKEND_URL placeholder in nginx config
BACKEND_URL=${BACKEND_URL:-http://backend:3000}

# Use sed to replace the placeholder
sed -i "s|\${BACKEND_URL}|${BACKEND_URL}|g" /etc/nginx/conf.d/default.conf

# Start nginx
exec nginx -g 'daemon off;'
