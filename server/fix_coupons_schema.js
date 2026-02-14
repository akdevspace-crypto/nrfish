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

async function fixCouponsTable() {
    try {
        const queries = [
            `ALTER TABLE coupons ADD COLUMN IF NOT EXISTS min_order_value DECIMAL(10, 2) DEFAULT 0;`,
            `ALTER TABLE coupons ADD COLUMN IF NOT EXISTS usage_limit INTEGER DEFAULT NULL;`,
            `ALTER TABLE coupons ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;`,
            `ALTER TABLE coupons ADD COLUMN IF NOT EXISTS specific_product_ids JSONB DEFAULT '[]'::jsonb;`,
            `ALTER TABLE coupons ADD COLUMN IF NOT EXISTS specific_category_ids JSONB DEFAULT '[]'::jsonb;`,
            `ALTER TABLE coupons ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;`
        ];

        for (const query of queries) {
            await pool.query(query);
            console.log(`Executed: ${query}`);
        }

        console.log("✅ Coupons table schema fixed successfully");
    } catch (error) {
        console.error("❌ Error fixing coupons table:", error);
    } finally {
        await pool.end();
    }
}

fixCouponsTable();
