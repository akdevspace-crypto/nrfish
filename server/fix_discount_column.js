
import { pool } from './configs/db.js';

async function fixDiscountColumn() {
    try {
        console.log("Starting schema fix for 'coupons' table...");

        // Drop the 'discount' column if it exists
        await pool.query(`
            ALTER TABLE coupons 
            DROP COLUMN IF EXISTS discount;
        `);
        console.log("✅ 'discount' column dropped successfully (if it existed).");

        // Verify 'discount_percentage' exists
        const res = await pool.query(`
            SELECT column_name, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'coupons' AND column_name = 'discount_percentage';
        `);

        if (res.rows.length === 0) {
            console.log("⚠️ 'discount_percentage' column NOT found. Creating it...");
            await pool.query(`
                ALTER TABLE coupons 
                ADD COLUMN discount_percentage INTEGER CHECK (discount_percentage > 0 AND discount_percentage <= 100) NOT NULL DEFAULT 0;
            `);
            console.log("✅ 'discount_percentage' column created.");
        } else {
            console.log("✅ 'discount_percentage' column exists.");
        }

    } catch (err) {
        console.error("❌ Error fixing schema:", err);
    } finally {
        pool.end();
    }
}

fixDiscountColumn();
