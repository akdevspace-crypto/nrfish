
import { pool } from '../configs/db.js';

const createPaymentsTable = async () => {
    try {
        console.log("🚀 Starting Migration: Payments Table...");

        // 1. Create Payments Table
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS payments (
                id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                amount DECIMAL(10, 2) NOT NULL,
                currency VARCHAR(10) DEFAULT 'INR',
                payment_method VARCHAR(20) CHECK (payment_method IN ('RAZORPAY', 'COD')),
                transaction_id VARCHAR(100),
                status VARCHAR(20) CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED')) DEFAULT 'PENDING',
                verification_status VARCHAR(20) CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')) DEFAULT 'PENDING',
                verified_by INTEGER REFERENCES users(id),
                verified_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await pool.query(createTableQuery);
        console.log("✅ 'payments' table created/verified.");

        // 2. Add payment_status to Orders table if not exists
        // We use a safe DO block to avoid errors if column exists
        const alterOrderQuery = `
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='payment_status') THEN
                    ALTER TABLE orders ADD COLUMN payment_status VARCHAR(50) DEFAULT 'Pending';
                END IF;
            END $$;
        `;
        await pool.query(alterOrderQuery);
        console.log("✅ 'orders' table updated with 'payment_status'.");

        console.log("🎉 Migration Completed Successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration Failed:", error);
        process.exit(1);
    }
};

createPaymentsTable();
