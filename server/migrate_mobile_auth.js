import dotenv from 'dotenv';
dotenv.config();

import { pool } from './configs/db.js';

const migrateMobileAuth = async () => {
    try {
        console.log("Adding Mobile column to users table...");

        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS mobile VARCHAR(15) UNIQUE;
        `);

        console.log("✅ Mobile column added successfully.");

    } catch (error) {
        console.error("❌ Migration failed:", error.message);
    } finally {
        pool.end();
    }
};

migrateMobileAuth();
