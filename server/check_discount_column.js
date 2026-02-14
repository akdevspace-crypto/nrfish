
import { pool } from './configs/db.js';

async function checkDiscountColumn() {
    try {
        const res = await pool.query(`
            SELECT column_name, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'coupons' AND column_name = 'discount';
        `);
        console.log("Checking for 'discount' column:");
        console.log(JSON.stringify(res.rows, null, 2));

        const res2 = await pool.query(`
            SELECT column_name, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'coupons' AND column_name = 'discount_percentage';
        `);
        console.log("Checking for 'discount_percentage' column:");
        console.log(JSON.stringify(res2.rows, null, 2));

    } catch (err) {
        console.error("Error checking schema:", err);
    } finally {
        pool.end();
    }
}

checkDiscountColumn();
