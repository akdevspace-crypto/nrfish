import dotenv from 'dotenv';
// Explicitly point to specific .env file location based on where script is run from
dotenv.config({ path: 'server/.env' });

// CRITICAL FIX: Unset PG_HOST/PG_PORT/PG_USER/PG_PASSWORD if they exist, 
// because node-postgres might prioritize them over the connectionString 
// or get confused if they point to localhost while connectionString points to Supabase.
delete process.env.PG_HOST;
delete process.env.PG_PORT;
delete process.env.PG_USER;
delete process.env.PG_PASSWORD;
delete process.env.PG_DATABASE;

import { pool } from './configs/db.js';

async function migrateCategories() {
    console.log('Connecting to DB...');
    // Debug: Print connection string (masked)
    console.log("Using Database URL:", process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + "..." : "UNDEFINED");

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Create Categories Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                image VARCHAR(255) NOT NULL,
                overlay_color VARCHAR(50) DEFAULT '#000000',
                cta_text VARCHAR(50) DEFAULT 'Shop Now',
                sort_order INTEGER DEFAULT 0,
                status VARCHAR(20) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Created categories table');

        await client.query('COMMIT');
        console.log('✅ Category migration successful');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('❌ Category migration failed:', e);
    } finally {
        client.release();
        pool.end();
    }
}

migrateCategories();
