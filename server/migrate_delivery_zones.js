import dotenv from 'dotenv';
// Point to correct .env location
dotenv.config({ path: 'server/.env' });

// Cleanup conflicting env vars
delete process.env.PG_HOST;
delete process.env.PG_PORT;
delete process.env.PG_USER;
delete process.env.PG_PASSWORD;
delete process.env.PG_DATABASE;

import { pool } from './configs/db.js';

async function migrateDeliveryZones() {
    console.log('Connecting to DB to create Delivery Zones table...');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Create delivery_zones Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS delivery_zones (
                id SERIAL PRIMARY KEY,
                pincode VARCHAR(20) NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Created delivery_zones table');

        // Seed initial data if empty
        const { rows } = await client.query('SELECT COUNT(*) FROM delivery_zones');
        if (parseInt(rows[0].count) === 0) {
            const initialPincodes = ["560001", "560002", "560037", "560066"];
            for (const pin of initialPincodes) {
                await client.query('INSERT INTO delivery_zones (pincode) VALUES ($1)', [pin]);
            }
            console.log('✅ Seeded initial pincodes');
        }

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

migrateDeliveryZones();
