// Database connection helper for Vercel Postgres
const { sql } = require('@vercel/postgres');

async function query(text, params = []) {
  try {
    // Convert numbered placeholders ($1, $2) if not already
    const result = await sql.query(text, params);
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

module.exports = { query, queryOne, queryAll, sql };
