import dotenv from 'dotenv';
import path from 'path';

// Load env vars from server root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const migratePayments = async () => {
    try {
        const { pool } = await import('../configs/db.js');
        console.log("🔄 Starting Payment Schema Migration...");

        // 1. Update PAYMENTS Table
        // We are using VARCHAR for flexibility, but practically using it as ENUM in code.
        // We ensure columns exist.
        await pool.query(`
            ALTER TABLE payments 
            ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'PENDING',
            ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255),
            ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
        `);
        console.log("✅ Payments table columns verified/added.");

        // 2. Update ORDERS Table
        await pool.query(`
            ALTER TABLE orders 
            ADD COLUMN IF NOT EXISTS payment_type VARCHAR(50), 
            ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'Pending',
            ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE;
        `);
        console.log("✅ Orders table columns verified/added.");

        // 3. Optional: Add constraints if you really want to enforce values at DB level
        // For now, valid values are handled in application logic to avoid strict ENUM migration issues
        // but we can add check constraints if needed.

        console.log("✅ Migration Completed Successfully.");
        process.exit(0);

    } catch (error) {
        console.error("❌ Migration Failed:", error);
        process.exit(1);
    }
};

migratePayments();
