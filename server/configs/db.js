import { Pool } from 'pg';
import dotenv from 'dotenv';

const connectionString = process.env.DATABASE_URL;

console.log(`🔌 Connecting to DB... ${connectionString ? 'URL Found' : 'URL Missing'}`);

// Remove sslmode=require from the connection string to prevent pg from forcing specific SSL verification
// which conflicts with our explicit ssl config for self-signed certs (common in Supabase transaction poolers)
const poolConfig = {
  connectionString: connectionString ? connectionString.replace('sslmode=require', '') : undefined,
  ssl: {
    rejectUnauthorized: false
  }
};

const pool = new Pool(poolConfig);

// Log when the database connects successfully
pool.on('connect', () => {
  console.log('✅ Database Connected');
});

// Function to test the connection
const connectDB = async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Database query test successful:', res.rows[0].now);
  } catch (error) {
    console.error('❌ Database Connection Error:', error.message);
    process.exit(1);
  }
};

export { connectDB, pool };
