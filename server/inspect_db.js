
import { pool } from './configs/db.js';
import fs from 'fs';

async function inspect() {
    try {
        const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'products';
    `);
        fs.writeFileSync('schema.json', JSON.stringify(res.rows, null, 2));
        console.log('Schema written to schema.json');
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

inspect();
