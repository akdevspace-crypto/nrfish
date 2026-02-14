
import 'dotenv/config';
import { pool } from './configs/db.js';

async function inspect() {
    try {
        console.log("Inspecting 'delivery_partners'...");
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'delivery_partners';
        `);
        const columns = res.rows.map(r => r.column_name);
        // console.log("Columns:", columns);
        console.log("HAS_PASSWORD_HASH:", columns.includes('password_hash'));
    } catch (e) {
        console.error("Inspect Failed:", e);
    } finally {
        pool.end();
    }
}
inspect();
