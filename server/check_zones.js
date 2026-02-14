import dotenv from 'dotenv';
dotenv.config({ path: 'server/.env' });
delete process.env.PG_HOST; // Cleanup conflicting env vars
delete process.env.PG_PORT;

import { pool } from './configs/db.js';

async function checkZones() {
    try {
        const res = await pool.query('SELECT * FROM delivery_zones');
        console.log('Delivery Zones Count:', res.rows.length);
        console.log('Zones:', res.rows.map(r => r.pincode));
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

checkZones();
