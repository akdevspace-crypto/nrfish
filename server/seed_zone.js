import dotenv from 'dotenv';
dotenv.config({ path: 'server/.env' });
delete process.env.PG_HOST;

import { pool } from './configs/db.js';

async function seedTestZone() {
    try {
        const pincode = "560001";
        const check = await pool.query('SELECT * FROM delivery_zones WHERE pincode = $1', [pincode]);
        if (check.rows.length === 0) {
            await pool.query('INSERT INTO delivery_zones (pincode) VALUES ($1)', [pincode]);
            console.log(`✅ Added test pincode: ${pincode}`);
        } else {
            console.log(`ℹ️ Test pincode ${pincode} already exists.`);
        }
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

seedTestZone();
