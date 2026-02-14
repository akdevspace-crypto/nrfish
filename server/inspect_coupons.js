import { pool } from './configs/db.js';

async function checkColumns() {
    try {
        const res = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'coupons';
    `);
        console.log("Columns in 'coupons' table:");
        console.log(res.rows.map(r => r.column_name).join(', '));
    } catch (err) {
        console.error("Error checking columns:", err);
    } finally {
        pool.end();
    }
}

checkColumns();
