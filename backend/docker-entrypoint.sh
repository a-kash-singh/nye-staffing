#!/bin/sh
# Don't exit on error - let the app handle connection issues
set +e

echo "Checking database connection..."

# Function to check database using Node.js
check_db_with_node() {
  node -e "
    const { Pool } = require('pg');
    let pool;
    try {
      if (process.env.DATABASE_URL) {
        pool = new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false }
        });
      } else if (process.env.DB_HOST) {
        pool = new Pool({
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT || '5432'),
          database: process.env.DB_NAME || 'nye_staffing',
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD,
          ssl: process.env.NODE_ENV === 'production' && process.env.DB_HOST && !process.env.DB_HOST.includes('localhost')
            ? { rejectUnauthorized: false }
            : false,
        });
      } else {
        console.error('No database configuration found');
        process.exit(1);
      }
      
      pool.query('SELECT 1')
        .then(() => {
          pool.end();
          process.exit(0);
        })
        .catch((err) => {
          console.error('Database check failed:', err.message);
          pool.end();
          process.exit(1);
        });
    } catch (err) {
      console.error('Database check error:', err.message);
      process.exit(1);
    }
  "
}

# Quick check (only 5 attempts, 3 seconds each)
MAX_ATTEMPTS=5
ATTEMPT=0
DB_READY=false

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  if check_db_with_node 2>&1; then
    echo "✅ Database is ready!"
    DB_READY=true
    break
  fi
  
  ATTEMPT=$((ATTEMPT + 1))
  if [ $ATTEMPT -lt $MAX_ATTEMPTS ]; then
    echo "⏳ Database check failed (attempt $ATTEMPT/$MAX_ATTEMPTS) - retrying..."
    sleep 3
  fi
done

if [ "$DB_READY" = "false" ]; then
  echo "⚠️  Database connection check failed, but continuing..."
  echo "   The application will attempt to connect on startup."
  echo "   Make sure DATABASE_URL or DB_* variables are set correctly."
fi

# Run migrations if needed
# node database/migrate.js

# Start the application (don't exit on error from health check)
set -e
exec "$@"
