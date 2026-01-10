#!/bin/sh

# Replace BACKEND_URL placeholder in nginx config
# Default to localhost for docker-compose, or use env var for Render
BACKEND_URL=${BACKEND_URL:-http://localhost:3000}

# Use sed to replace the placeholder in the template
sed "s|\${BACKEND_URL}|${BACKEND_URL}|g" /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Start nginx
exec nginx -g 'daemon off;'
