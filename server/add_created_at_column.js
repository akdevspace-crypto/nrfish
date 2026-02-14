import { pool } from './configs/db.js';

async function addCreatedAtColumn() {
    try {
        await pool.query(`
      ALTER TABLE coupons 
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);
        console.log("✅ 'created_at' column added successfully.");
    } catch (error) {
        console.error("❌ Error adding column:", error);
    } finally {
        pool.end();
    }
}

addCreatedAtColumn();
