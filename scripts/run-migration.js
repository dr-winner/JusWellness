const { Pool } = require('pg');
const fs = require('fs');

// Supabase direct connection (pooler mode)
const DATABASE_URL = `postgresql://postgres.bscgilotxkyvjrtaqlxf:${process.env.DB_PASSWORD}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`;

const sql = fs.readFileSync('supabase/migrations/003_sales_production_inventory_redesign.sql', 'utf8');

async function main() {
  if (!process.env.DB_PASSWORD) {
    console.error('ERROR: Set DB_PASSWORD env var (your Supabase database password)');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

  try {
    console.log('Connecting to Supabase database...');
    const client = await pool.connect();
    console.log('Connected. Running migration...');
    await client.query(sql);
    console.log('Migration completed successfully!');
    client.release();
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
