import { pool } from './configs/db.js';

async function verifySchema() {
    try {
        const res = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'coupons';
    `);

        console.log("\n--- COUPONS TABLE SCHEMA ---");
        console.table(res.rows.map(r => ({
            Column: r.column_name,
            Type: r.data_type,
            Nullable: r.is_nullable,
            Default: r.column_default
        })));

        const required = [
            'code', 'type', 'discount_percentage', 'valid_until',
            'min_order_value', 'specific_product_ids', 'specific_category_ids',
            'usage_limit', 'created_at', 'is_active', 'usage_count'
        ];

        const existing = res.rows.map(r => r.column_name);
        const missing = required.filter(col => !existing.includes(col));

        if (missing.length > 0) {
            console.error("\n❌ MISSING COLUMNS:", missing.join(', '));
        } else {
            console.log("\n✅ All required columns are present.");
        }

    } catch (err) {
        console.error("Error verifying schema:", err);
    } finally {
        pool.end();
    }
}

verifySchema();
