import dotenv from 'dotenv';
dotenv.config();

import { pool } from './configs/db.js';

const migrateOTPs = async () => {
    try {
        console.log("Creating otps table...");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS otps (
                id SERIAL PRIMARY KEY,
                mobile VARCHAR(15) NOT NULL,
                otp_hash VARCHAR(255) NOT NULL,
                purpose VARCHAR(50) NOT NULL, -- 'LOGIN' or 'DELIVERY'
                order_id INT DEFAULT NULL, -- Nullable for login OTPs
                expires_at TIMESTAMP NOT NULL,
                is_used BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        console.log("✅ otps table created successfully.");

    } catch (error) {
        console.error("❌ Migration failed:", error.message);
    } finally {
        pool.end();
    }
};

migrateOTPs();
