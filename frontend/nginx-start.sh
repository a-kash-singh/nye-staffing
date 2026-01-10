#!/bin/sh

# Replace BACKEND_URL placeholder in nginx config
# For Docker Compose: use service name
# For Render: use full URL from env var
BACKEND_URL=${BACKEND_URL:-http://backend:3000}

# If BACKEND_URL doesn't contain ://, it's just a hostname (Docker service name)
if echo "$BACKEND_URL" | grep -q "://"; then
  # Full URL provided (e.g., https://backend.onrender.com)
  BACKEND_PROXY="$BACKEND_URL"
else
  # Just hostname provided (e.g., backend:3000 or backend)
  if echo "$BACKEND_URL" | grep -q ":"; then
    BACKEND_PROXY="http://${BACKEND_URL}"
  else
    BACKEND_PROXY="http://${BACKEND_URL}:3000"
  fi
fi

# Use sed to replace the placeholder in the template
sed "s|\${BACKEND_URL}|${BACKEND_PROXY}|g" /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Start nginx
exec nginx -g 'daemon off;'
