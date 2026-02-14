
import { pool } from './configs/db.js';

async function migrate() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Add weight column
        await client.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS weight TEXT;
    `);
        console.log('✅ Added weight column');

        // Add tags column
        await client.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS tags TEXT[];
    `);
        console.log('✅ Added tags column');

        await client.query('COMMIT');
        console.log('✅ Migration successful');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', e);
    } finally {
        client.release();
        pool.end();
    }
}

migrate();
