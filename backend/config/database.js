const { Pool } = require('pg');
require('dotenv').config();

// Build connection config
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'nye_staffing',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Render PostgreSQL requires SSL in production
if (process.env.NODE_ENV === 'production' && process.env.DB_HOST && !process.env.DB_HOST.includes('localhost')) {
  dbConfig.ssl = {
    rejectUnauthorized: false, // Render uses self-signed certificates
  };
}

// Support DATABASE_URL (Render provides this)
if (process.env.DATABASE_URL) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
  
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
  });
  
  module.exports = pool;
} else {
  const pool = new Pool(dbConfig);
  
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
  });
  
  module.exports = pool;
}

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;
