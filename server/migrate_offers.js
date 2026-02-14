
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
const cleanConnectionString = connectionString ? connectionString.replace('sslmode=require', '') : '';

console.log("Connecting to database...");

const pool = new Pool({
    connectionString: cleanConnectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

async function createOffersTable() {
    try {
        const queryText = `
      CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- Ensure pgcrypto is enabled for UUID generation

      DROP TYPE IF EXISTS offer_type_enum CASCADE;
      CREATE TYPE offer_type_enum AS ENUM ('B1G1', 'B3G1', 'COMBO', 'CUSTOM');

      DROP TYPE IF EXISTS discount_type_enum CASCADE;
      CREATE TYPE discount_type_enum AS ENUM ('FLAT', 'PERCENTAGE');

      CREATE TABLE IF NOT EXISTS offers (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        type offer_type_enum NOT NULL,
        discount_type discount_type_enum NOT NULL,
        discount_value DECIMAL(10, 2) NOT NULL DEFAULT 0,
        
        -- Logic Fields
        buy_x INTEGER DEFAULT NULL, -- For Buy X Get Y
        get_y INTEGER DEFAULT NULL, -- For Buy X Get Y
        
        -- Targeting
        required_product_ids JSONB DEFAULT '[]'::jsonb, -- Products required to trigger offer
        required_category_ids JSONB DEFAULT '[]'::jsonb, -- Categories required to trigger offer
        combo_product_ids JSONB DEFAULT '[]'::jsonb, -- Specific products for Combo deals
        
        -- Validity
        start_date TIMESTAMP WITH TIME ZONE NOT NULL,
        end_date TIMESTAMP WITH TIME ZONE NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        
        -- Limits
        usage_limit INTEGER DEFAULT NULL,
        usage_count INTEGER DEFAULT 0,
        
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

        await pool.query(queryText);
        console.log("✅ Offers table created successfully");
    } catch (error) {
        console.error("❌ Error creating offers table:", error);
    } finally {
        await pool.end();
    }
}

createOffersTable();
