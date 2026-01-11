#!/bin/sh
set -e

echo "Waiting for database to be ready..."

# Use DATABASE_URL if available (Render provides this)
if [ -n "$DATABASE_URL" ]; then
  echo "Using DATABASE_URL for connection..."
  until pg_isready -d "$DATABASE_URL" 2>/dev/null || pg_isready -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USER" 2>/dev/null; do
    echo "Database is unavailable - sleeping"
    sleep 1
  done
else
  # Fallback to individual DB variables
  until pg_isready -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USER" 2>/dev/null; do
    echo "Database is unavailable - sleeping"
    sleep 1
  done
fi

echo "Database is ready!"

# Run migrations if needed
# node database/migrate.js

# Start the application
exec "$@"
