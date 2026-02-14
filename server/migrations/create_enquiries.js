import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
const cleanConnectionString = connectionString ? connectionString.replace('sslmode=require', '') : '';

const pool = new Pool({
    connectionString: cleanConnectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

const createEnquiriesTable = async () => {
    const client = await pool.connect();
    try {
        const query = `
            CREATE TABLE IF NOT EXISTS enquiries (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                mobile VARCHAR(20) NOT NULL,
                product_id VARCHAR(255),
                message TEXT NOT NULL,
                status VARCHAR(50) DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await client.query(query);
        console.log("Enquiries table created successfully.");
    } catch (error) {
        console.error("Error creating enquiries table:", error);
    } finally {
        client.release();
        await pool.end();
    }
};

createEnquiriesTable();
