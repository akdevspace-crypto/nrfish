import dotenv from 'dotenv';
import path from 'path';

// Load env vars from server root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const migrateDeliverySchema = async () => {
    try {
        const { pool } = await import('../configs/db.js');
        console.log("🚚 Starting Delivery Partner Schema Migration...");

        // 1. Create delivery_partners table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS delivery_partners (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                mobile VARCHAR(20) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                vehicle_no VARCHAR(50),
                license_no VARCHAR(50),
                proof_image TEXT,
                partner_photo TEXT,
                is_verified BOOLEAN DEFAULT FALSE,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log("✅ Created 'delivery_partners' table.");

        // 2. Add columns to orders table
        // Check if columns exist first to avoid errors on re-run, or just use try/catch blocks for each ALTER
        // Using distinct ALTER statements for clarity

        try {
            await pool.query(`
                ALTER TABLE orders 
                ADD COLUMN IF NOT EXISTS delivery_partner_id UUID REFERENCES delivery_partners(id),
                ADD COLUMN IF NOT EXISTS delivery_status VARCHAR(50) DEFAULT 'Pending',
                ADD COLUMN IF NOT EXISTS delivery_otp_verified BOOLEAN DEFAULT FALSE;
            `);
            console.log("✅ Updated 'orders' table with delivery columns.");
        } catch (e) {
            console.log("⚠️ Error updating orders table (might already exist):", e.message);
        }

        // 3. Add constraint for delivery_status ensuring it matches our ENUM values
        // We first drop it if it exists to ensure we can update the list of allowed values if needed
        try {
            await pool.query(`
                ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_delivery_status_check;
            `);
            await pool.query(`
                ALTER TABLE orders 
                ADD CONSTRAINT orders_delivery_status_check 
                CHECK (delivery_status IN (
                    'Pending', 'Order Placed', 'Order Confirmed', 'Processing', 'Preparing', 'Packing', 
                    'ASSIGNED', 'SHIPPED', 'ON_THE_WAY', 'DESTINATION_REACHED', 'WAITING_FOR_CUSTOMER', 'DELIVERED', 'Cancelled'
                ));
            `);
            console.log("✅ Added validation constraint for delivery_status.");
        } catch (e) {
            console.log("⚠️ Error adding constraint:", e.message);
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Migration Failed:", error);
        process.exit(1);
    }
};

migrateDeliverySchema();
