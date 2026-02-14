
import 'dotenv/config';
import { pool } from "./configs/db.js";

async function inspectProducts() {
    try {
        console.log("--- Inspecting Products Table ---");
        const client = await pool.connect();

        // Check data
        const res = await client.query(`
      SELECT id, name, category, in_stock, image FROM products 
      ORDER BY created_at DESC 
      LIMIT 5;
    `);

        console.log("\nSample Products (Top 10):");
        if (res.rows.length === 0) {
            console.log("No products found in the database.");
        } else {
            console.table(res.rows);
        }

        client.release();
    } catch (err) {
        console.error("Error inspecting products:", err);
    } finally {
        pool.end();
    }
}

inspectProducts();
