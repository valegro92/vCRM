// Database connection helper for Neon Postgres (Vercel Marketplace)
const { Pool } = require('pg');

// Create connection pool
let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

async function query(text, params = []) {
  try {
    const client = getPool();
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Helper per query semplici
async function queryOne(text, params = []) {
  const result = await query(text, params);
  return result.rows[0] || null;
}

async function queryAll(text, params = []) {
  const result = await query(text, params);
  return result.rows;
}

module.exports = { query, queryOne, queryAll, getPool };
