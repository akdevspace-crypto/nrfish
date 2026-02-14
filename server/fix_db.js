
import 'dotenv/config'; // Load env vars
import { pool } from "./configs/db.js";

async function fixProducts() {
    try {
        console.log("--- Inspecting & Fixing Products ---");
        const client = await pool.connect();

        // 1. Check current data
        const res = await client.query(`
      SELECT id, name, category, in_stock FROM products;
    `);

        console.log(`Found ${res.rows.length} products.`);
        console.table(res.rows.slice(0, 5)); // Show first 5

        // 2. Fix in_stock = true if any are false/null
        console.log("Ensuring all products are in_stock = true for debugging...");
        const updateRes = await client.query(`
      UPDATE products SET in_stock = true WHERE in_stock IS NOT true;
    `);
        console.log(`Updated ${updateRes.rowCount} products to in_stock = true.`);

        // 3. Fix Categories (Case sensitivity check)
        // Ensure "Fish & Seafood" matches what the frontend expects if needed, 
        // but the new backend code uses LOWER() so it should be fine.
        // However, let's normalize just in case.

        client.release();
    } catch (err) {
        console.error("Error:", err);
    } finally {
        pool.end();
    }
}

fixProducts();
