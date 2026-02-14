
import { pool } from './configs/db.js';

async function checkSchema() {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'coupons'
            ORDER BY ordinal_position;
        `);
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error("Error checking schema:", err);
    } finally {
        pool.end();
    }
}

checkSchema();
