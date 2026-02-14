import { pool } from './configs/db.js';

async function fixAllColumns() {
    const queries = [
        "ALTER TABLE coupons ADD COLUMN IF NOT EXISTS code VARCHAR(50) UNIQUE NOT NULL;",
        "ALTER TABLE coupons ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'USER_BASED';",
        "ALTER TABLE coupons ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5, 2) DEFAULT 0;",
        "ALTER TABLE coupons ADD COLUMN IF NOT EXISTS valid_until TIMESTAMP;",
        "ALTER TABLE coupons ADD COLUMN IF NOT EXISTS min_order_value DECIMAL(10, 2) DEFAULT 0;",
        "ALTER TABLE coupons ADD COLUMN IF NOT EXISTS usage_limit INTEGER DEFAULT NULL;",
        "ALTER TABLE coupons ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;",
        "ALTER TABLE coupons ADD COLUMN IF NOT EXISTS specific_product_ids JSONB DEFAULT '[]'::jsonb;",
        "ALTER TABLE coupons ADD COLUMN IF NOT EXISTS specific_category_ids JSONB DEFAULT '[]'::jsonb;",
        "ALTER TABLE coupons ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;",
        "ALTER TABLE coupons ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;"
    ];

    try {
        for (const query of queries) {
            await pool.query(query);
            console.log(`Executed: ${query.split('ADD COLUMN IF NOT EXISTS')[1].split(';')[0].trim()}`);
        }
        console.log("✅ All coupon columns verified/added successfully.");
    } catch (error) {
        console.error("❌ Error fixing columns:", error);
    } finally {
        pool.end();
    }
}

fixAllColumns();
