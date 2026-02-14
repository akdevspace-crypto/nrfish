import { pool } from '../configs/db.js';

const createEnquiriesTable = async () => {
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
        await pool.query(query);
        console.log("Enquiries table created successfully (reusing db.js pool).");
    } catch (error) {
        console.error("Error creating enquiries table:", error);
    } finally {
        await pool.end();
    }
};

createEnquiriesTable();
