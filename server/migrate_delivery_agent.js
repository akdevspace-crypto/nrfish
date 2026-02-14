import dotenv from 'dotenv';
dotenv.config();

import { pool } from './configs/db.js';

const migrateDeliveryAgent = async () => {
    try {
        console.log("Adding Delivery Agent columns to orders table...");

        await pool.query(`
            ALTER TABLE orders 
            ADD COLUMN IF NOT EXISTS delivery_agent_name VARCHAR(255),
            ADD COLUMN IF NOT EXISTS delivery_agent_phone VARCHAR(50),
            ADD COLUMN IF NOT EXISTS delivery_vehicle_no VARCHAR(50),
            ADD COLUMN IF NOT EXISTS delivery_live_status VARCHAR(100) DEFAULT 'Assigned';
        `);

        console.log("✅ Delivery Agent columns added successfully.");

    } catch (error) {
        console.error("❌ Migration failed:", error.message);
    } finally {
        pool.end();
    }
};

migrateDeliveryAgent();
