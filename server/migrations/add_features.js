import { pool } from '../configs/db.js';

const migrate = async () => {
    try {
        console.log("Starting migration...");

        // 1. Add is_bestseller to products
        await pool.query(`
            ALTER TABLE products 
            ADD COLUMN IF NOT EXISTS is_bestseller BOOLEAN DEFAULT FALSE;
        `);
        console.log("Added is_bestseller to products.");

        // 2. Create offers table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS offers (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                discount_type TEXT CHECK (discount_type IN ('FLAT', 'PERCENTAGE')),
                discount_value NUMERIC NOT NULL,
                start_date TIMESTAMP,
                end_date TIMESTAMP,
                image TEXT,
                product_ids TEXT[], -- Array of product IDs applicable for this offer
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log("Created offers table.");

        // 3. Create coupons table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS coupons (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                code TEXT UNIQUE NOT NULL,
                min_order_value NUMERIC DEFAULT 0,
                discount_value NUMERIC NOT NULL,
                discount_type TEXT CHECK (discount_type IN ('FLAT', 'PERCENTAGE')) DEFAULT 'FLAT',
                expiry_date TIMESTAMP,
                usage_limit INTEGER,
                used_count INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log("Created coupons table.");

        console.log("Migration completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

migrate();
