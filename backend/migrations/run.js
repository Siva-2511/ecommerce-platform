require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/db');

async function runMigrations() {
  console.log('🚀 Starting Database Migrations...');
  
  try {
    const sql = fs.readFileSync(path.join(__dirname, '001_schema.sql'), 'utf8');
    
    // Execute the SQL schema
    await pool.query(sql);
    
    console.log('✅ Schema migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

runMigrations();
