import dotenv from 'dotenv';
import path from 'path';

// Load env vars from server root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const inspectConstraints = async () => {
    try {
        const { pool } = await import('../configs/db.js');
        console.log("🔍 Inspecting Payments Table Constraints...");

        const res = await pool.query(`
            SELECT con.conname, pg_get_constraintdef(con.oid) 
            FROM pg_catalog.pg_constraint con
            INNER JOIN pg_catalog.pg_class rel ON rel.oid = con.conrelid
            INNER JOIN pg_catalog.pg_namespace nsp ON nsp.oid = connamespace
            WHERE nsp.nspname = 'public' AND rel.relname = 'payments';
        `);

        console.log("Constraints found:", res.rows);
        process.exit(0);
    } catch (error) {
        console.error("❌ Inspection Failed:", error);
        process.exit(1);
    }
};

inspectConstraints();
