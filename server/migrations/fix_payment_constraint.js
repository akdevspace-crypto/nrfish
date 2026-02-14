import dotenv from 'dotenv';
import path from 'path';

// Load env vars from server root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const fixConstraints = async () => {
    try {
        const { pool } = await import('../configs/db.js');
        console.log("🛠️ Fixing Payments Constraint...");

        // 1. Drop existing constraint
        await pool.query(`
            ALTER TABLE payments 
            DROP CONSTRAINT IF EXISTS payments_payment_method_check;
        `);
        console.log("✅ Dropped old constraint.");

        // 2. Add new constraint supporting CASHFREE
        // We include RAZORPAY just in case old data exists and we don't want to violate it, though user asked to remove it from logic.
        // Data integrity suggests keeping it valid for historical rows if they exist.
        await pool.query(`
            ALTER TABLE payments 
            ADD CONSTRAINT payments_payment_method_check 
            CHECK (payment_method IN ('CASHFREE', 'COD', 'RAZORPAY'));
        `);
        console.log("✅ Added new constraint (CASHFREE, COD, RAZORPAY).");

        process.exit(0);
    } catch (error) {
        console.error("❌ Fix Failed:", error);
        process.exit(1);
    }
};

fixConstraints();
