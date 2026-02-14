import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
const cleanConnectionString = connectionString ? connectionString.replace('sslmode=require', '') : '';

const pool = new Pool({
    connectionString: cleanConnectionString,
    ssl: { rejectUnauthorized: false }
});

async function alterCouponsTable() {
    try {
        const queryText = `
      ALTER TABLE coupons 
      ADD COLUMN IF NOT EXISTS specific_category_ids JSONB DEFAULT '[]'::jsonb;
    `;
        await pool.query(queryText);
        console.log("✅ Coupons table altered: specific_category_ids added.");
    } catch (error) {
        console.error("❌ Error altering coupons table:", error);
    } finally {
        await pool.end();
    }
}

alterCouponsTable();
