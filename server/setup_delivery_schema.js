import 'dotenv/config';
import { pool } from './configs/db.js';

const setupDeliverySchema = async () => {
    try {
        console.log("🚀 Starting Delivery System Schema Setup...");

        // 1. Create delivery_partners table
        console.log("📦 Creating 'delivery_partners' table...");
        await pool.query(`DROP TABLE IF EXISTS delivery_partners CASCADE;`);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS delivery_partners (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                mobile VARCHAR(20) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                vehicle_no VARCHAR(50),
                license_no VARCHAR(50),
                proof_doc_url TEXT,
                photo_url TEXT,
                is_active BOOLEAN DEFAULT FALSE,
                is_verified BOOLEAN DEFAULT FALSE,
                current_latitude FLOAT,
                current_longitude FLOAT,
                total_orders_assigned INT DEFAULT 0,
                total_orders_delivered INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log("✅ 'delivery_partners' table ready.");

        // 2. Create or Update otps table
        console.log("🔐 Checking 'otps' table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS otps (
                id SERIAL PRIMARY KEY,
                mobile VARCHAR(15) NOT NULL,
                otp_hash VARCHAR(255) NOT NULL,
                purpose VARCHAR(50) NOT NULL,
                order_id INT DEFAULT NULL,
                expires_at TIMESTAMP NOT NULL,
                is_used BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log("✅ 'otps' table ready.");

        // 3. Update orders table
        console.log("🚚 Updating 'orders' table...");

        // Add delivery_partner_id
        await pool.query(`
            ALTER TABLE orders 
            ADD COLUMN IF NOT EXISTS delivery_partner_id UUID REFERENCES delivery_partners(id),
            ADD COLUMN IF NOT EXISTS delivery_otp_verified BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS delivery_status VARCHAR(50) DEFAULT 'Pending';
        `);

        console.log("✅ 'orders' table updated.");

        console.log("🎉 Delivery System Schema Setup Complete!");

    } catch (error) {
        console.log("SCHEMA SETUP FAILED:", error.message);
        console.log(error);
    } finally {
        pool.end();
    }
};

setupDeliverySchema();
