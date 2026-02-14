import { pool } from './configs/db.js';

async function addTypeColumn() {
    try {
        await pool.query(`
      ALTER TABLE coupons 
      ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'USER_BASED';
    `);
        console.log("✅ 'type' column added successfully.");
    } catch (error) {
        console.error("❌ Error adding type column:", error);
    } finally {
        pool.end();
    }
}

addTypeColumn();
