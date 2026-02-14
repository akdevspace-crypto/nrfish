
import { pool } from '../configs/db.js';

const inspectTables = async () => {
    try {
        console.log("🔍 Inspecting Tables...");

        const query = `
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name IN ('orders', 'users') AND column_name = 'id';
        `;
        const { rows } = await pool.query(query);
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (error) {
        console.error("❌ Inspection Failed:", error);
        process.exit(1);
    }
};

inspectTables();
