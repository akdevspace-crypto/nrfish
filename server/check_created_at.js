import { pool } from './configs/db.js';

async function checkColumns() {
    try {
        const res = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'coupons';
    `);

        const columns = res.rows.map(r => r.column_name);
        console.log("Columns:", columns);

        if (!columns.includes('created_at')) {
            console.log("❌ 'created_at' column is MISSING!");
        } else {
            console.log("✅ 'created_at' column exists.");
        }
    } catch (err) {
        console.error("Error checking columns:", err);
    } finally {
        pool.end();
    }
}

checkColumns();
