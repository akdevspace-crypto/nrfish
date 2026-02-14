// MUST be first — forces IPv4 (Render does not support IPv6)
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import 'dotenv/config';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

console.log(`🔌 Connecting to DB... ${connectionString ? 'URL Found' : 'URL Missing'}`);

if (!connectionString) {
  console.error('❌ DATABASE_URL is not defined');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('connect', () => {
  console.log('✅ Database Connected');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected PG error', err);
  process.exit(1);
});

const connectDB = async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Database query test successful:', res.rows[0].now);
  } catch (error) {
    console.error('❌ Database Connection Error:', error);
    process.exit(1);
  }
};

export { connectDB, pool };
