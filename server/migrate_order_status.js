import dotenv from 'dotenv';
dotenv.config();

import { pool } from './configs/db.js';

const migrateOrderStatus = async () => {
    try {
        console.log("Adding 'status' column to orders table...");

        // Add status column if it doesn't exist, default to 'Order Placed'
        await pool.query(`
            ALTER TABLE orders 
            ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Order Placed';
        `);

        // Update existing orders to have 'Order Placed' if null (or 'Delivered' if is_delivered is true)
        await pool.query(`
            UPDATE orders 
            SET status = 'Delivered' 
            WHERE is_delivered = TRUE AND (status IS NULL OR status = 'Order Placed');
        `);

        console.log("✅ 'status' column added and backfilled successfully.");

    } catch (error) {
        console.error("❌ Migration failed:", error.message);
    } finally {
        pool.end();
    }
};

migrateOrderStatus();
