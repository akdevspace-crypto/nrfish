import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Explicitly load .env from current directory (since we run node migrate_coupons.js from server dir)
dotenv.config();

const { Pool } = pg;

// Logic from server/configs/db.js
const connectionString = process.env.DATABASE_URL;
const cleanConnectionString = connectionString ? connectionString.replace('sslmode=require', '') : '';

console.log("Connecting using:", cleanConnectionString ? "Connection String Found" : "No Connection String");

const pool = new Pool({
    connectionString: cleanConnectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

async function createCouponsTable() {
    try {
        const queryText = `
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";
      
      CREATE TABLE IF NOT EXISTS coupons (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        type VARCHAR(20) CHECK (type IN ('USER_BASED', 'PRODUCT_BASED', 'VALUE_BASED', 'LIMITED_DEALS')) NOT NULL,
        discount_percentage INTEGER CHECK (discount_percentage > 0 AND discount_percentage <= 100) NOT NULL,
        valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
        min_order_value DECIMAL(10, 2) DEFAULT 0,
        specific_product_ids JSONB DEFAULT '[]'::jsonb,
        is_active BOOLEAN DEFAULT TRUE,
        usage_limit INTEGER DEFAULT NULL,
        usage_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
        await pool.query(queryText);
        console.log("✅ Coupons table created successfully");
    } catch (error) {
        console.error("❌ Error creating coupons table:", error);
    } finally {
        await pool.end();
    }
}

createCouponsTable();
