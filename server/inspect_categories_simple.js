
import 'dotenv/config';
import { pool } from "./configs/db.js";

async function inspectCategories() {
    try {
        const client = await pool.connect();

        // Check distinct categories
        const res = await client.query(`SELECT DISTINCT category FROM products;`);

        console.log("Distinct Categories in DB:");
        console.log(JSON.stringify(res.rows, null, 2));

        client.release();
    } catch (err) {
        console.error("Error:", err);
    } finally {
        pool.end();
    }
}

inspectCategories();
