#!/bin/sh

# Replace BACKEND_URL placeholder in nginx config
# Default to localhost for docker-compose, or use env var for Render
BACKEND_URL=${BACKEND_URL:-http://backend:3000}

# Remove protocol and path if present, keep just host:port
# Handle both http://backend:3000 and https://backend.onrender.com formats
if echo "$BACKEND_URL" | grep -q "://"; then
  BACKEND_HOST=$(echo "$BACKEND_URL" | sed 's|https\?://||' | sed 's|/.*||')
else
  BACKEND_HOST="$BACKEND_URL"
fi

# Use sed to replace the placeholder in the template
sed "s|\${BACKEND_URL}|http://${BACKEND_HOST}|g" /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Start nginx
exec nginx -g 'daemon off;'
