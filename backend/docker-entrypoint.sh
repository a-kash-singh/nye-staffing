#!/bin/sh
set -e

echo "Waiting for database to be ready..."

# Function to check database using Node.js (more reliable than pg_isready)
check_db_with_node() {
  node -e "
    const { Pool } = require('pg');
    const pool = new Pool(
      process.env.DATABASE_URL 
        ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
        : {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            database: process.env.DB_NAME || 'nye_staffing',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD,
            ssl: process.env.NODE_ENV === 'production' && process.env.DB_HOST && !process.env.DB_HOST.includes('localhost')
              ? { rejectUnauthorized: false }
              : false,
          }
    );
    pool.query('SELECT 1')
      .then(() => { process.exit(0); })
      .catch(() => { process.exit(1); });
  " 2>/dev/null
}

# Try to connect with a timeout
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  if check_db_with_node; then
    echo "Database is ready!"
    break
  fi
  
  ATTEMPT=$((ATTEMPT + 1))
  if [ $ATTEMPT -ge $MAX_ATTEMPTS ]; then
    echo "Warning: Database connection check failed after $MAX_ATTEMPTS attempts"
    echo "Continuing anyway - application will handle connection errors..."
    break
  fi
  
  echo "Database is unavailable - sleeping (attempt $ATTEMPT/$MAX_ATTEMPTS)"
  sleep 2
done

# Run migrations if needed
# node database/migrate.js

# Start the application
exec "$@"
