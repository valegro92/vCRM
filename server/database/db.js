const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Use /data for persistent storage on Sevalla/cloud platforms
// Falls back to local path for development
let dbPath = process.env.DB_PATH ||
  (process.env.NODE_ENV === 'production'
    ? '/data/crm.db'
    : path.join(__dirname, 'crm.db'));

// Ensure directory exists
let dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  try {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log(`Created database directory: ${dbDir}`);
  } catch (err) {
    console.error('Failed to create database directory:', err.message);
    // Fallback to local directory if /data is not writable
    dbPath = path.join(__dirname, 'crm.db');
    dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    console.log(`Using fallback database path: ${dbPath}`);
  }
}


const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log(`Connected to SQLite database at: ${dbPath}`);
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

module.exports = db;
